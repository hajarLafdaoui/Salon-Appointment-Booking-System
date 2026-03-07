const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['email', 'sms'], required: true },
    subject: { type: String },
    message: { type: String, required: true },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;