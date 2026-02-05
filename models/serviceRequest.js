const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    type: { type: String, enum: ['food', 'bus', 'customer'], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;
