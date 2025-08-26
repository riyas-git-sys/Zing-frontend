import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../validations/auth.validation.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;