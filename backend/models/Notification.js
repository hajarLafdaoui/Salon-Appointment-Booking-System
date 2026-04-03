const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    recipientRole: { type: String, enum: ['admin', 'staff', 'customer'], required: false },
    type: { type: String, enum: ['booking_new', 'booking_cancel', 'customer_new', 'booking_completed', 'reminder', 'system'], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;