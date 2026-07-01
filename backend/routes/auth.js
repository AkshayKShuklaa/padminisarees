const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

// POST /auth/register
router.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }

  // Check if user already exists
  const existingUser = await db.findOne('users', { email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = await db.insert('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user' // default role
    });

    // Generate token
    const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /auth/login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await db.findOne('users', { email: email.toLowerCase() });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  try {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// POST /guest/send-otp
router.post('/guest/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }
  
  console.log(`[Mock OTP] Sending OTP 123456 to phone: ${phone}`);
  res.json({ success: true, message: 'OTP sent successfully (Use code: 123456)' });
});

// POST /guest/verify-otp
router.post('/guest/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required' });
  }

  // Accept any OTP or specifically '123456' for ease of testing
  if (otp !== '123456' && otp !== '1234') {
    return res.status(400).json({ message: 'Invalid OTP code. Use 123456' });
  }

  try {
    // Create or find a guest user
    let user = await db.findOne('users', { email: `guest_${phone}@akaya.com` });
    if (!user) {
      user = await db.insert('users', {
        name: `Guest (${phone})`,
        email: `guest_${phone}@akaya.com`,
        phone: phone,
        role: 'guest'
      });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

module.exports = router;
