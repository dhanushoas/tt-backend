require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test_db';

// --- SECURITY MIDDLEWARE ---
app.use(helmet()); // Basic security headers
app.use(mongoSanitize());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Global Rate Limiter: 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(globalLimiter);

// Stricter Rate Limiter for Bookings and Contact: 5 requests per 15 minutes
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many submissions. Please wait before trying again.'
});

// --- PASSPORT CONFIG ---
require('./config/passport');
app.use(passport.initialize());

const authenticationMiddleware = require('./middleware/authentication');

// --- ROUTES ---
const imageRoutes = require('./routes/image');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const bookRoutes = require('./routes/book');
const selectedPlaceRoutes = require('./routes/selectedPlace');
const paymentRoutes = require('./routes/payment');
const contactRoutes = require('./routes/contact');
const serviceRequestRoutes = require('./routes/serviceRequest');
const authRoutes = require('./routes/auth');

// Publicly Accessible Routes (No token needed for GET or guest POST)
app.use('/auth', authRoutes);
app.use('/contact', submissionLimiter, contactRoutes);
app.use('/service-request', serviceRequestRoutes);

// Image routes: GET is public, others are protected
app.use('/image', (req, res, next) => {
  if (req.method === 'GET') return next();
  return authenticationMiddleware(req, res, next);
}, imageRoutes);

// Booking routes: POST (guest booking) and GET (view by ID) are public
app.use('/book', (req, res, next) => {
  // Allow guest to post a new booking or view their own booking summary
  if (req.method === 'POST' && req.path === '/add') return submissionLimiter(req, res, next);
  if (req.method === 'GET' && req.path.startsWith('/getByCustomId')) return next();
  // Others (update, delete, get all) need authentication (Admin/Owner)
  return authenticationMiddleware(req, res, next);
}, bookRoutes);

// Protected Routes
app.use('/api/visits', authenticationMiddleware, selectedPlaceRoutes);
app.use('/pay', authenticationMiddleware, paymentRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
