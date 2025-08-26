import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../validations/auth.validation.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/register', (req, res) => {
  res.status(405).json({ message: 'Use POST method for registration' });
});
export default router;