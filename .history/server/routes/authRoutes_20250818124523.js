import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../validations/auth.validation.js';

const router = express.Router();

router.route('/register')
  .post(authController.register)
  .all((req, res) => {
    res.set('Allow', 'POST');
    res.status(405).send('Method Not Allowed');
  });

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/register', (req, res) => {
  res.status(405).json({ message: 'Use POST method for registration' });
});
export default router;