const express = require('express');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile/:id', protect, updateProfile);

module.exports = router;