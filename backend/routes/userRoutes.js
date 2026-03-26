const express = require('express');
const { getUsers, getCustomers, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers);

router.route('/customers')
  .get(protect, admin, getCustomers);

router.route('/:id')
  .delete(protect, admin, deleteUser);

module.exports = router;