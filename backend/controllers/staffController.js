const Staff = require('../models/Staff');
const User = require('../models/User');
const path = require('path');
const Appointment = require('../models/Appointment');

// CREATE STAFF (Admin only)
const createStaff = async (req, res) => {
  try {
    const { name, email, specialty, bio, experienceYears, workingDays, workingHours, services, isActive, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required for staff accounts.' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required for staff accounts.' });
    }

    const normalizedName = String(name || '').trim();
    if (!normalizedName) {
      return res.status(400).json({ message: 'Staff name is required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: 'staff'
    });
    
    let imageUrl = "https://via.placeholder.com/300";
    if (req.file) {
      imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const staffData = {
      user: user._id,
      name: normalizedName,
      specialty,
      bio: bio || '',
      experienceYears: Number(experienceYears) || 0,
      workingHours: workingHours ? (typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours) : { start: '09:00', end: '18:00' },
      workingDays: workingDays ? (typeof workingDays === 'string' ? JSON.parse(workingDays) : workingDays) : [],
      services: services ? (typeof services === 'string' ? JSON.parse(services) : services) : [],
      isActive: isActive === 'true' || isActive === true,
      image: imageUrl
    };

    const staff = new Staff(staffData);
    const createdStaff = await staff.save();
    res.status(201).json(createdStaff);
  } catch (error) {
    console.error('Create Staff Error:', error);
    res.status(500).json({ message: error.message });
  }
};



// GET ALL STAFF (Public for booking page & Admin for management)
const getAllStaff = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 100; // Large limit for list if needed
    const page = Number(req.query.page) || 1;
    const name = req.query.name || '';
    const specialty = req.query.specialty || '';
    const isAdminRequest = req.query.admin === 'true';

    const query = {};
    if (!isAdminRequest) {
      query.isActive = true;
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (specialty) {
      query.specialty = specialty;
    }

    const count = await Staff.countDocuments(query);
    const staff = await Staff.find(query)
      .populate("services", "name price duration")
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ rating: -1, createdAt: -1 })
      .lean();

    res.json({
      staff,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET STAFF BY ID
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate("services")
      .populate("user", "name email")
      .lean();

    if (staff) {
      res.json(staff);
    } else {
      res.status(404).json({ message: "Staff not found" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE STAFF (Admin or that staff)
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const { name, specialty, bio, experienceYears, workingDays, workingHours, services, isActive } = req.body;

    staff.name = name ? String(name).trim() : staff.name;
    staff.specialty = specialty || staff.specialty;
    staff.bio = bio || staff.bio;
    staff.experienceYears = experienceYears ? Number(experienceYears) : staff.experienceYears;
    staff.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : staff.isActive;

    if (workingHours) {
      staff.workingHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;
    }
    if (workingDays) {
      staff.workingDays = typeof workingDays === 'string' ? JSON.parse(workingDays) : workingDays;
    }
    if (services) {
      staff.services = typeof services === 'string' ? JSON.parse(services) : services;
    }

    if (req.file) {
      staff.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const updatedStaff = await staff.save();

    // Keep the linked auth username in sync for staff logins.
    if (updatedStaff.user) {
      await User.findByIdAndUpdate(updatedStaff.user, { name: updatedStaff.name });
    }
    res.json(updatedStaff);

  } catch (error) {
    console.error('Update Staff Error:', error);
    res.status(500).json({ message: error.message });
  }
};



// GET STAFF SELF (staff only)
const getStaffMe = async (req, res) => {
  try {
    if (req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Staff access required' });
    }

    const staff = await Staff.findOne({ user: req.user._id })
      .populate('user', 'name email phone')
      .populate('services')
      .lean();

    if (!staff) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    res.json({ staff, user: staff.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE STAFF SELF (staff only)
const updateStaffMe = async (req, res) => {
  try {
    if (req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Staff access required' });
    }

    const staff = await Staff.findOne({ user: req.user._id });
    if (!staff) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    const { name, bio, workingDays, workingHours } = req.body;

    if (name) staff.name = String(name).trim();
    if (bio !== undefined) staff.bio = bio;

    if (workingDays !== undefined) {
      staff.workingDays = typeof workingDays === 'string' ? JSON.parse(workingDays) : workingDays;
    }

    if (workingHours !== undefined) {
      staff.workingHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;
    }

    if (req.file) {
      staff.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const updatedStaff = await staff.save();

    // Keep auth username in sync for staff login by name.
    await User.findByIdAndUpdate(req.user._id, { name: updatedStaff.name });

    const updatedUser = await User.findById(req.user._id).select('name email phone');
    res.json({ staff: updatedStaff, user: updatedUser });
  } catch (error) {
    console.error('Update Staff Me Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// STAFF DASHBOARD DATA (stats + today's appointments list)
const getStaffDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Staff access required' });
    }

    const staff = await Staff.findOne({ user: req.user._id });
    if (!staff) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const [todayAppointmentsList, upcomingCount, completedCount, completedEarnings] = await Promise.all([
      Appointment.find({
        staff: staff._id,
        date: { $gte: startOfToday, $lte: endOfToday }
      })
        .populate('user', 'name email')
        .populate('service', 'name price duration')
        .sort({ date: 1 })
        .lean(),

      Appointment.countDocuments({
        staff: staff._id,
        date: { $gt: endOfToday },
        status: { $in: ['pending', 'confirmed'] }
      }),

      Appointment.countDocuments({
        staff: staff._id,
        status: 'completed'
      }),

      (async () => {
        const completedAppointments = await Appointment.find({
          staff: staff._id,
          status: 'completed'
        }).populate('service', 'price');
        return completedAppointments.reduce((sum, a) => sum + (a.service?.price || 0), 0);
      })()
    ]);

    res.json({
      stats: {
        todayAppointments: todayAppointmentsList.length,
        upcomingAppointments: upcomingCount,
        completedAppointments: completedCount,
        totalEarnings: completedEarnings
      },
      todayAppointmentsList
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE STAFF (Admin only)
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    await staff.deleteOne();

    res.json({ message: "Staff removed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  getStaffMe,
  updateStaffMe,
  getStaffDashboard,
  deleteStaff
};