const express = require('express');
const { createReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getReviews)
  .post(protect, createReview);

module.exports = router;