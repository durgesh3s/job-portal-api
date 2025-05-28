const User = require('../models/user.model');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Signup
exports.signup = async (req, res) => {
  const { fullName, username, phone, email, password } = req.body;
  const avatar = req.file?.path || null;

  const existingUser = await User.findOne({ $or: [{ email }, { phone }, { username }] });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const newUser = await User.create({
    fullName,
    username,
    phone,
    email,
    password,
    avatar,
  });

  res.status(201).json({ message: 'User registered successfully' });
};

// Login
exports.login = async (req, res) => {
  const { phoneOrEmail } = req.body;

  const user = await User.findOne({
    $or: [{ email: phoneOrEmail }, { phone: phoneOrEmail }],
  });

  if (!user) return res.status(400).json({ message: 'User not found' });

  // Mock OTP (to be replaced later)
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(`🔐 OTP for ${phoneOrEmail}: ${otp}`);

  res.status(200).json({
    message: 'OTP sent to user (console only)',
    debugOtp: otp,
    userId: user._id,
  });
};

// OTP Verification (Mock)
exports.verifyOtp = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.status(200).json({
    message: 'Logged in successfully',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
};

// Request password reset
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'No user found' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  console.log(`🔐 Reset link: /reset-password/${token}`);
  res.json({ message: 'Reset link sent (console)' });
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Token invalid or expired' });

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
};

