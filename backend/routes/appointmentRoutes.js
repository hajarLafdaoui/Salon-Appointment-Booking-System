const express = require('express');
const {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getMyStaffAppointments,
  updateStatus,
  cancelAppointment,
  getStaffBookedSlots,
} = require('../controllers/appointmentController');
const { protect, admin, staffOrAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, createAppointment)
  .get(protect, admin, getAllAppointments);

router.get('/my', protect, getMyAppointments);
router.get('/staff/me', protect, staffOrAdmin, getMyStaffAppointments);
router.get('/staff/:staffId', protect, getStaffBookedSlots);

router.put('/:id/status', protect, staffOrAdmin, updateStatus);
router.delete('/:id', protect, cancelAppointment);

module.exports = router;