const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all customers with analytics (total bookings, spent)
// @route   GET /api/users/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password');
    
    // Compute stats for each customer
    const data = [];
    for (const customer of customers) {
      const apps = await Appointment.find({ user: customer._id })
        .sort({ date: -1 })
        .populate('service', 'name price');
        
      const totalSpent = apps
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.service ? a.service.price : 0), 0);
        
      const bookingHistory = apps.map(a => ({
        _id: a._id,
        serviceName: a.service ? a.service.name : 'Custom Service',
        date: a.date,
        price: a.service ? a.service.price : 0,
        status: a.status
      }));

      data.push({
        ...customer.toObject(),
        totalAppointments: apps.length,
        totalSpent,
        lastAppointment: apps.length > 0 ? apps[0].date : null,
        bookingHistory
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.remove();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, getCustomers, deleteUser };