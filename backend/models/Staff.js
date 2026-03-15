const mongoose = require('mongoose');

const staffSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    image: {
      type: String,
      default: "https://via.placeholder.com/300"
    },

    specialty: {
      type: String,
      required: true
    },

    bio: {
      type: String
    },

    experienceYears: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 4.5
    },

    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      }
    ],

    workingDays: [
      {
        type: String
      }
    ],

    workingHours: {
      start: String,
      end: String
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;