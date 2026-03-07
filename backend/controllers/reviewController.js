const Review = require('../models/Review');
const Appointment = require('../models/Appointment');

// @desc    Create a review (customer, only for completed appointments)
// @route   POST /api/reviews
// @access  Private (customer)
const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    // Check if appointment exists and belongs to user
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: req.user._id,
      status: 'completed',
    });
    if (!appointment) {
      return res.status(400).json({ message: 'Appointment not found or not completed' });
    }

    // Check if review already exists
    const existing = await Review.findOne({ appointment: appointmentId });
    if (existing) {
      return res.status(400).json({ message: 'Review already exists for this appointment' });
    }

    const review = await Review.create({
      appointment: appointmentId,
      user: req.user._id,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a specific staff/service (public)
// @route   GET /api/reviews?staffId=xxx&serviceId=xxx
// @access  Public
const getReviews = async (req, res) => {
  try {
    const { staffId, serviceId } = req.query;
    const filter = {};
    if (staffId) filter['appointment.staff'] = staffId;
    if (serviceId) filter['appointment.service'] = serviceId;

    const reviews = await Review.find().populate({
      path: 'appointment',
      match: filter,
      populate: { path: 'staff service', select: 'name specialty' },
    }).populate('user', 'name');

    
    // Filter out reviews where appointment doesn't match (populate returns null if not matched)
    const filtered = reviews.filter(r => r.appointment !== null);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getReviews };