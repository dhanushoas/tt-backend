const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');

// POST /contact/submit
// Stores contact form submissions
router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newContact = new Contact({
            name,
            email,
            subject,
            message
        });

        await newContact.save();

        res.status(201).json({ message: 'Message sent successfully!', success: true });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;
