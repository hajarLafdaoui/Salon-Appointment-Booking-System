const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // customer
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: Date, required: true }, // we'll store full date + start time
    endTime: { type: Date, required: true }, // calculated
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Ensure no double-booking for same staff at same time
appointmentSchema.index({ staff: 1, date: 1, endTime: 1 }, { unique: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;