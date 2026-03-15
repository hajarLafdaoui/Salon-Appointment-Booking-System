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
    },
    
    portfolioImages: [
      {
        type: String
      }
    ],

    phoneNumber: {
      type: String
    },

    websiteUrl: {
      type: String
    }
  },
  { timestamps: true }
);

// Add indices for performance
staffSchema.index({ name: 'text', specialty: 'text' });
staffSchema.index({ name: 1 });
staffSchema.index({ specialty: 1 });

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;