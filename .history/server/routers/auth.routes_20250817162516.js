const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/profile', auth, upload.single('profilePicture'), authController.updateProfile);

module.exports = router;