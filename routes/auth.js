const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Auth with Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

const admin = require('../config/firebase');
const User = require('../models/user'); // Import User model

// Google Sign-In with Firebase Token
router.post('/google-signin', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: 'ID Token is required' });
    }

    // Check if Firebase Admin is initialized
    if (!admin.apps || admin.apps.length === 0) {
        console.error('Firebase Admin not initialized');
        return res.status(503).json({
            message: 'Auth Service Unavailable',
            details: 'Firebase Admin not initialized on server',
            diagnostic: {
                hasEnvVar: !!process.env.FIREBASE_SERVICE_ACCOUNT,
                hasLocalFile: require('fs').existsSync(require('path').join(__dirname, '../config/firebase-service-account.json'))
            }
        });
    }

    try {
        // Verify the token with Firebase
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, uid, picture } = decodedToken;

        // Check if user exists in MongoDB
        let user = await User.findOne({ gmailId: email });

        if (!user) {
            // Create new user
            user = new User({
                username: name || email.split('@')[0],
                gmailId: email,
                googleId: uid, // Use Firebase UID as Google ID
                // Add dummy password or handle passwordless
                password: await require('bcrypt').hash(Math.random().toString(36), 10)
            });
            await user.save();
        } else if (!user.googleId) {
            // Link existing user
            user.googleId = uid;
            await user.save();
        }

        // Generate App JWT
        const payload = {
            id: user.id,
            username: user.username,
            gmailId: user.gmailId
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '10m' });

        res.json({
            message: 'Login successful',
            token,
            username: user.username,
            authenticated: true
        });

    } catch (error) {
        console.error('Firebase Verification Error Details:', JSON.stringify(error, null, 2));
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);

        if (error.code === 'auth/argument-error') {
            return res.status(400).json({ message: 'Invalid Firebase Token format' });
        }
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ message: 'Firebase Token has expired' });
        }

        res.status(401).json({ message: 'Invalid Token', details: error.message });
    }
});

// Callback route for Google
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        // Generate JWT Token
        const payload = {
            id: req.user.id,
            username: req.user.username,
            gmailId: req.user.gmailId
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

        // Redirect to frontend with token
        // Assuming frontend is running on localhost:4200
        res.redirect(`http://localhost:4200/signin?token=${token}&username=${req.user.username}`);
    }
);

// Mock Google Login for Development
router.get('/google/mock', (req, res) => {
    // Simulate a user
    const mockUser = {
        id: 'mock_google_id_123',
        username: 'MockUser',
        gmailId: 'mockuser@gmail.com'
    };

    const payload = {
        id: mockUser.id,
        username: mockUser.username,
        gmailId: mockUser.gmailId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

    // Redirect to frontend with token
    res.redirect(`http://localhost:4200/signin?token=${token}&username=${mockUser.username}`);
});

module.exports = router;
