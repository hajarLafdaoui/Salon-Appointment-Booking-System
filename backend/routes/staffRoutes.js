const express = require('express');

const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');

const { protect, admin, staffOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();


// PUBLIC ROUTE (used for booking page)
router.get('/', getAllStaff);


// ADMIN CREATE STAFF
router.post('/', protect, admin, createStaff);


// GET ONE STAFF PROFILE
router.get('/:id', getStaffById);


// UPDATE STAFF
router.put('/:id', protect, staffOrAdmin, updateStaff);


// DELETE STAFF
router.delete('/:id', protect, admin, deleteStaff);


module.exports = router;