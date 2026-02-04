const express = require('express');
const bcrypt = require('bcrypt');
const Admin = require('../models/admin');
const router = express.Router();

// Admin Registration Route
router.post('/register', async (req, res) => {
  const { adminname, gmailId, dob, password } = req.body;

  try {
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ gmailId });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Gmail ID already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin with additional fields
    const newAdmin = new Admin({
      adminname,
      gmailId,
      dob,
      password: hashedPassword,
    });

    // Save the new admin
    await newAdmin.save();

    res.status(200).json({ message: 'Registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin Login Route
router.post('/login', async (req, res) => {
  const { adminname, password } = req.body;

  try {
    const admin = await Admin.findOne({ adminname });
    if (!admin) {
      return res.status(401).json({ authenticated: false, message: 'Invalid adminname or password' });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ authenticated: false, message: 'Invalid adminname or password' });
    }
    
    res.status(200).json({ authenticated: true, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
