const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const router = express.Router();


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

    // Create a new user with additional fields
    const newUser = new User({
      username,
      gmailId,
      dob,
      password: hashedPassword,
    });

    // Save the new user
    await newUser.save();

    res.status(200).json({ message: 'Registered successfully' });
  } catch (error) {
    console.error(error);
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
