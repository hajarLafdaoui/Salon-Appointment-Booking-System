const express = require('express');
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getAllServices)
  .post(protect, admin, createService);

router.route('/:id')
  .get(getServiceById)
  .put(protect, admin, updateService)
  .delete(protect, admin, deleteService);

module.exports = router;