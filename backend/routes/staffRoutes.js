const express = require('express');
const upload = require('../middleware/uploadMiddleware');

const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  getStaffMe,
  updateStaffMe,
  getStaffDashboard,
  deleteStaff
} = require('../controllers/staffController');

const { protect, admin, staffOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();


// PUBLIC ROUTE (used for booking page & admin=true for full list)
router.get('/', getAllStaff);


// ADMIN CREATE STAFF (with optional image upload)
router.post('/', protect, admin, upload.single('image'), createStaff);

// STAFF SELF PROFILE
router.get('/me', protect, staffOrAdmin, getStaffMe);
router.put('/me', protect, staffOrAdmin, upload.single('image'), updateStaffMe);

// STAFF DASHBOARD DATA
router.get('/dashboard', protect, staffOrAdmin, getStaffDashboard);


// GET ONE STAFF PROFILE
router.get('/:id', getStaffById);


// UPDATE STAFF (with optional image upload)
router.put('/:id', protect, staffOrAdmin, upload.single('image'), updateStaff);


// DELETE STAFF
router.delete('/:id', protect, admin, deleteStaff);


module.exports = router;