const express = require('express');
const { createReview, getReviews, getMyReviewedAppointments } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getReviews)
  .post(protect, createReview);

router.route('/my-reviewed')
  .get(protect, getMyReviewedAppointments);

module.exports = router;