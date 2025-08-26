const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { uploadToCloudinary } = require('../utils/cloudinary');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, mobile: user.mobile },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, mobile, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this mobile number' });
    }

    // Create new user
    const user = new User({
      name,
      mobile,
      password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      profilePicture: user.profilePicture,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ message: 'Invalid mobile or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid mobile or password' });
    }

    const token = generateToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      profilePicture: user.profilePicture,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, status } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (status) user.status = status;

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      user.profilePicture = result.secure_url;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      profilePicture: user.profilePicture,
      status: user.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};