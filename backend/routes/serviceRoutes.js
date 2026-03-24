const express = require('express');
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/')
  .get(getAllServices)
  .post(protect, admin, upload.single('image'), createService);

router.route('/:id')
  .get(getServiceById)
  .put(protect, admin, upload.single('image'), updateService)
  .delete(protect, admin, deleteService);

module.exports = router;