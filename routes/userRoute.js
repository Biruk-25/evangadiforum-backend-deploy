const express = require('express');
const router = express.Router();

const {
  register,
  login,
  checkUser,
  updateUser,
  deleteUser,
  } = require('../controller/userController');

const authenticate = require('../middleware/authenticate');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Check authenticated user
router.get('/check', authenticate, checkUser);
// Update user profile
router.put('/update', authenticate, updateUser);

// Delete user account
router.delete('/delete', authenticate, deleteUser);

module.exports = router;


