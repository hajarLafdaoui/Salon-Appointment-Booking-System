const Notification = require('../models/Notification');

// GET /api/notifications
// Retrieves notifications for the logged-in user
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        // Fetch notifications specifically for the user, or globally for their role
        let query = {};
        if (role === 'admin') {
            query = { $or: [{ recipient: userId }, { recipientRole: 'admin' }] };
        } else if (role === 'staff') {
            query = { $or: [{ recipient: userId }, { recipientRole: 'staff' }] };
        } else {
            query = { recipient: userId };
        }

        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error fetching notifications" });
    }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Server error marking notification as read" });
    }
};

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        let query = {};
        if (role === 'admin') {
            query = { $or: [{ recipient: userId }, { recipientRole: 'admin' }], isRead: false };
        } else if (role === 'staff') {
            query = { $or: [{ recipient: userId }, { recipientRole: 'staff' }], isRead: false };
        } else {
            query = { recipient: userId, isRead: false };
        }

        await Notification.updateMany(query, { $set: { isRead: true } });
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Server error marking all notifications as read" });
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };