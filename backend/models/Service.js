const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['Hair', 'Skincare', 'Nails', 'Makeup', 'Brows & Lashes', 'Spa & Massage'],
      required: true
    },
    duration: { type: Number, required: true }, // minutes
    price: { type: Number, required: true },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    // staff who can perform this service (many-to-many)
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }],
  },
  { timestamps: true }
);

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;