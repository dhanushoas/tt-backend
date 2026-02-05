const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscription');

// POST /subscription/subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if already subscribed
        const existing = await Subscription.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'You are already subscribed!' });
        }

        const newSub = new Subscription({ email });
        await newSub.save();

        res.status(201).json({ message: 'Subscribed successfully!', success: true });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;
