const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const Staff = require('../models/Staff');
const asyncHandler = require('express-async-handler');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // 1. Total Appointments
  const totalAppointments = await Appointment.countDocuments();

  // 2. Today's Appointments
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  
  const todayAppointmentsCount = await Appointment.countDocuments({
    date: { $gte: startOfToday, $lte: endOfToday }
  });

  const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

  const upcomingToday = await Appointment.countDocuments({
    date: { $gte: new Date(), $lte: endOfToday },
    status: { $in: ['pending', 'confirmed'] }
  });

  // 3. Total Revenue
  const completedAppointments = await Appointment.find({ status: 'completed' }).populate('service', 'price');
  const totalRevenue = completedAppointments.reduce((sum, app) => sum + (app.service?.price || 0), 0);

  // 4. Total Customers
  const totalCustomers = await User.countDocuments({ role: 'customer' });

  // 5. Active Staff
  const activeStaffCount = await Staff.countDocuments({ isAvailable: true });

  // 6. Chart: Appointments Last 7 Days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const count = await Appointment.countDocuments({
      date: { $gte: d, $lt: nextD }
    });

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    last7Days.push({ name: dayName, count });
  }

  // 7. Chart: Popular Services
  const serviceStats = await Appointment.aggregate([
    {
      $group: {
        _id: '$service',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'services',
        localField: '_id',
        foreignField: '_id',
        as: 'serviceInfo'
      }
    },
    {
      $unwind: '$serviceInfo'
    },
    {
      $project: {
        name: '$serviceInfo.name',
        count: 1
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);

  // 8. Today's Appointments List
  const todayAppointmentsList = await Appointment.find({
    date: { $gte: startOfToday, $lte: endOfToday }
  })
    .populate('user', 'name email')
    .populate('service', 'name price')
    .populate('staff', 'user')
    .sort({ date: 1 });

  res.json({
    stats: {
      totalAppointments,
      todayAppointments: todayAppointmentsCount,
      upcomingToday,
      totalRevenue,
      totalCustomers,
      activeStaff: activeStaffCount,
      cancelledAppointments
    },
    charts: {
      appointmentsTrend: last7Days,
      popularServices: serviceStats
    },
    todayAppointmentsList
  });
});

module.exports = {
  getDashboardStats
};
