const express = require('express');
const { submitApplication, getApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Public route to submit application
router.route('/')
    .post(submitApplication)
    .get(protect, admin, getApplications); // Admin route to view apps

// Admin route to approve/reject
router.route('/:id/status')
    .put(protect, admin, updateApplicationStatus);

module.exports = router;
