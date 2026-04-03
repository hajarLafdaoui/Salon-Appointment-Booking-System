const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/sendEmail');

// @desc    Create a new appointment (customer)
// @route   POST /api/appointments
// @access  Private (customer)
const createAppointment = async (req, res) => {
  try {
    const { staffId, serviceId, date, notes } = req.body;
    const userId = req.user._id;

    // Get service to calculate end time
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Convert date string to Date object (assuming ISO format with time)
    const startTime = new Date(date);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // Check if staff exists and is active
    const staff = await Staff.findById(staffId);
    if (!staff || !staff.isActive) return res.status(400).json({ message: 'Staff not available' });

    // Check for overlapping appointments for the same staff
    const overlapping = await Appointment.findOne({
      staff: staffId,
      date: { $lt: endTime, $gte: startTime }, // simplified; better to check both start and end
      // More precise: appointments that overlap with [startTime, endTime]
      $or: [
        { date: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
      ],
    });
    if (overlapping) {
      return res.status(400).json({ message: 'Staff not available at that time' });
    }

    const appointment = await Appointment.create({
      user: userId,
      staff: staffId,
      service: serviceId,
      date: startTime,
      endTime,
      notes,
      status: 'pending',
    });

    // Populate data for response
    const populated = await Appointment.findById(appointment._id)
      .populate('user', 'name email')
      .populate('staff', 'specialty')
      .populate('service', 'name price');

    // Send email notification (async)
    sendEmail({
      to: req.user.email,
      subject: 'Appointment Confirmation',
      text: `Your appointment for ${service.name} on ${startTime.toLocaleString()} is pending confirmation.`,
    }).catch(err => console.log('Email error:', err));

    // Create notifications
    const staffUser = await Staff.findById(staffId).populate('user');
    const timeStr = startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    if (staffUser && staffUser.user) {
        await Notification.create({
            recipient: staffUser.user._id,
            recipientRole: 'staff',
            type: 'booking_new',
            message: `You have a new booking at ${timeStr} (${service.name})`,
        });
    }

    await Notification.create({
        recipientRole: 'admin',
        type: 'booking_new',
        message: `New booking: ${service.name} with ${staffUser ? staffUser.name : 'Unknown'} at ${timeStr}`,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's appointments
// @route   GET /api/appointments/my
// @access  Private (customer)
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('staff', 'name image specialty')
      .populate('service', 'name price')
      .sort('-date');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all appointments (admin) with filters
// @route   GET /api/appointments
// @access  Private/Admin
const getAllAppointments = async (req, res) => {
  try {
    const { date, staffId, status } = req.query;
    const filter = {};
    if (date) filter.date = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };
    if (staffId) filter.staff = staffId;
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('user', 'name email')
      .populate('staff', 'name specialty bio experienceYears rating')
      .populate('service', 'name price')
      .sort('date');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status (admin/staff)
// @route   PUT /api/appointments/:id/status
// @access  Private/StaffOrAdmin
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Staff can only update their own appointments.
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user._id });
      if (!staff) return res.status(403).json({ message: 'Not authorized' });
      if (appointment.staff.toString() !== staff._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    appointment.status = status;
    const updated = await appointment.save();

    if (status === 'completed') {
        const popAppt = await Appointment.findById(appointment._id)
            .populate('user')
            .populate('staff')
            .populate('service');
        if (popAppt.staff && popAppt.user && popAppt.service) {
            await Notification.create({
                recipientRole: 'admin',
                type: 'booking_completed',
                message: `${popAppt.staff.name} completed ${popAppt.service.name} for ${popAppt.user.name}`,
            });
        }
    }

    // Optionally send email to customer about status change
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in staff's appointments
// @route   GET /api/appointments/staff/me
// @access  Private (staff)
const getMyStaffAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Staff access required' });
    }

    const staff = await Staff.findOne({ user: req.user._id });
    if (!staff) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    const appointments = await Appointment.find({ staff: staff._id })
      .populate('user', 'name email')
      .populate('service', 'name price duration')
      .sort('-date');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booked slots for a staff member on a specific date
// @route   GET /api/appointments/staff/:staffId
// @access  Public or Private (customer checking availability)
const getStaffBookedSlots = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { date } = req.query;

    if (!staffId || !date) {
      return res.status(400).json({ message: 'Staff ID and date are required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      staff: staffId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).select('date');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel appointment (customer can cancel their own)
// @route   DELETE /api/appointments/:id
// @access  Private (customer or admin)
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Allow only the customer who booked or admin
    if (appointment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // You might want to set status to cancelled instead of deleting
    appointment.status = 'cancelled';
    await appointment.save();

    const popAppt = await Appointment.findById(appointment._id)
        .populate('user')
        .populate('staff')
        .populate('service');
    
    if (popAppt && popAppt.service && popAppt.user) {
        const timeStr = new Date(popAppt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        if (popAppt.staff && popAppt.staff.user) {
            await Notification.create({
                recipient: popAppt.staff.user,
                recipientRole: 'staff',
                type: 'booking_cancel',
                message: `Your ${timeStr} appointment was cancelled`,
            });
        }

        await Notification.create({
            recipientRole: 'admin',
            type: 'booking_cancel',
            message: `Booking cancelled: ${popAppt.service.name} by ${popAppt.user.name}`,
        });
    }

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getMyStaffAppointments,
  updateStatus,
  cancelAppointment,
  getStaffBookedSlots,
};