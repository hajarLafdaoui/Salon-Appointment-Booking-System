const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    specialty: {
        type: String,
        required: true,
    },
    experienceYears: {
        type: Number,
        required: true,
    },
    bio: {
        type: String,
        required: true,
    },
    portfolioLink: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Avoid duplicate pending applications per email
applicationSchema.index({ email: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
