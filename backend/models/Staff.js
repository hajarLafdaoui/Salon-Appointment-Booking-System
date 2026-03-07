const mongoose = require('mongoose');

const staffSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one-to-one
    },
    specialty: { type: String },
    bio: { type: String },
    isActive: { type: Boolean, default: true },
    // services offered will be handled via reference in Service or separate collection
  },
  { timestamps: true }
);

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;