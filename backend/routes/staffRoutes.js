const express = require('express');
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} = require('../controllers/staffController');
const { protect, admin, staffOrAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getAllStaff)
  .post(protect, admin, createStaff);

router.route('/:id')
  .get(getStaffById)
  .put(protect, staffOrAdmin, updateStaff)
  .delete(protect, admin, deleteStaff);

module.exports = router;