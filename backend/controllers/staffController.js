const Staff = require('../models/Staff');
const User = require('../models/User');

// @desc    Create staff profile (admin only)
// @route   POST /api/staff
// @access  Private/Admin
const createStaff = async (req, res) => {
  try {
    const { userId, specialty, bio } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if user already has staff profile
    const existing = await Staff.findOne({ user: userId });
    if (existing) return res.status(400).json({ message: 'Staff profile already exists' });

    // Update user role to staff if not already
    if (user.role !== 'staff') {
      user.role = 'staff';
      await user.save();
    }

    const staff = await Staff.create({ user: userId, specialty, bio });
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all staff
// @route   GET /api/staff
// @access  Public
const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ isActive: true }).populate('user', 'name email phone avatar');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single staff by ID
// @route   GET /api/staff/:id
// @access  Public
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('user', 'name email phone avatar');
    if (staff) {
      res.json(staff);
    } else {
      res.status(404).json({ message: 'Staff not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update staff profile
// @route   PUT /api/staff/:id
// @access  Private/StaffOrAdmin (staff can update own profile)
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    // Check if user is admin or the owner of this staff profile
    if (req.user.role !== 'admin' && staff.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    staff.specialty = req.body.specialty || staff.specialty;
    staff.bio = req.body.bio || staff.bio;
    staff.isActive = req.body.isActive !== undefined ? req.body.isActive : staff.isActive;

    const updated = await staff.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete staff profile (admin only)
// @route   DELETE /api/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (staff) {
      await staff.remove();
      res.json({ message: 'Staff removed' });
    } else {
      res.status(404).json({ message: 'Staff not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createStaff, getAllStaff, getStaffById, updateStaff, deleteStaff };