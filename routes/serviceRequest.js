const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/serviceRequest');

// POST /service-request/submit
router.post('/submit', async (req, res) => {
    try {
        const { type, name, email, details } = req.body;
        if (!type || !name || !email || !details) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newRequest = new ServiceRequest({ type, name, email, details });
        await newRequest.save();

        res.status(201).json({ message: 'Request submitted successfully!', success: true });
    } catch (error) {
        console.error('Service request error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;
