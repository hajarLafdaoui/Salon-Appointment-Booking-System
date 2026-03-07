const Notification = require('../models/Notification');

// @desc    Get all notifications (admin)
// @route   GET /api/notifications
// @access  Private/Admin
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate('user', 'name email').sort('-createdAt');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as sent (optional)
// @route   PUT /api/notifications/:id
// @access  Private/Admin
const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      notification.sentAt = req.body.sentAt || Date.now();
      await notification.save();
      res.json(notification);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, updateNotification };