import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or mobile already exists' 
      });
    }

    // Create new user
    const user = new User({ name, email, mobile, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    // Find user by email or mobile
    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { register, login };