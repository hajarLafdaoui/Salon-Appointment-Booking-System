const express = require('express');
const { getNotifications, updateNotification } = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, admin, getNotifications);

router.route('/:id')
  .put(protect, admin, updateNotification);

module.exports = router;