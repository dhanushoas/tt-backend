const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const router = express.Router();


const crypto = require('crypto');
const { sendVerificationEmail } = require('../config/mailer');

// Endpoint to check if an email exists
router.post('/check-email', async (req, res) => {
  const { gmailId } = req.body;

  try {
    // Check if the user with the provided email exists
    const existingUser = await User.findOne({ gmailId });

    if (existingUser) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// User Registration Route
router.post('/register', async (req, res) => {
  const { username, gmailId, dob, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ gmailId });
    if (existingUser) {
      return res.status(400).json({ message: 'Gmail ID already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate JWT containing user data (valid for 1 hour)
    const jwt = require('jsonwebtoken');
    const registrationToken = jwt.sign(
      { username, gmailId, dob, password: hashedPassword },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );

    // Send email with the JWT as the token
    await sendVerificationEmail(gmailId, registrationToken);

    res.status(200).json({
      message: 'Verification email sent! User will be created upon verification.',
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration/Email Error:', error);
    res.status(500).json({ error: 'Failed to send verification email. Please try again or check support.' });
  }
});

// Verify Email Route (Creates User in DB)
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  const jwt = require('jsonwebtoken');

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const { username, gmailId, dob, password } = decoded;

    // Check if user already exists (prevent duplicate creation if link clicked twice)
    let user = await User.findOne({ gmailId });
    if (user) {
      if (user.isVerified) {
        return res.status(200).json({ message: 'Email already verified. You can login.' });
      } else {
        user.isVerified = true;
        await user.save();
        return res.status(200).json({ message: 'Email verified successfully!' });
      }
    }

    // Create new user in DB
    const newUser = new User({
      username,
      gmailId,
      dob,
      password, // Already hashed in the token
      isVerified: true,
      registrationTime: new Date()
    });

    await newUser.save();

    res.status(200).json({ message: 'Email verified and account created successfully! You can now login.' });
  } catch (error) {
    console.error('Verification Error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Verification link expired. Please register again.' });
    }
    res.status(400).json({ message: 'Invalid verification token.' });
  }
});

// Resend Verification Route
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ gmailId: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verifyToken;
    await user.save();

    sendVerificationEmail(user.gmailId, verifyToken);
    res.json({ message: 'Verification email resent.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// User Login Route
router.post('/login', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Support both email and username login
    const query = email ? { gmailId: email } : { username: username };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({ authenticated: false, message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ authenticated: false, message: 'Invalid email or password' });
    }

    // Check Verification Status
    if (user.isVerified === false) {
      return res.status(403).json({
        authenticated: false,
        message: 'Email not verified. Please check your inbox.',
        requiresVerification: true,
        email: user.gmailId
      });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const payload = {
      id: user._id,
      username: user.username,
      gmailId: user.gmailId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '10m' });

    res.status(200).json({
      authenticated: true,
      message: 'Login success',
      token: token,
      username: user.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
