const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// @desc    Create a review (customer, only for completed appointments)
// @route   POST /api/reviews
// @access  Private (customer)
const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    // Check if appointment exists and belongs to user and is completed
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: req.user._id,
      status: 'completed',
    }).populate('service', 'name');

    if (!appointment) {
      return res.status(400).json({ message: 'Appointment not found or not completed' });
    }

    // Check if review already exists
    const existing = await Review.findOne({ appointment: appointmentId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this appointment' });
    }

    const review = await Review.create({
      appointment: appointmentId,
      user: req.user._id,
      service: appointment.service?._id || null,
      rating,
      comment,
    });

    // Notify admin
    await Notification.create({
      recipientRole: 'admin',
      type: 'system',
      message: `New testimonial submitted by ${req.user.name}`,
    }).catch(e => console.error('Notification error:', e));

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews (public, for landing page)
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviewed appointment IDs for a user
// @route   GET /api/reviews/my-reviewed
// @access  Private
const getMyReviewedAppointments = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).select('appointment');
    const reviewedIds = reviews.map(r => r.appointment.toString());
    res.json(reviewedIds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getReviews, getMyReviewedAppointments };