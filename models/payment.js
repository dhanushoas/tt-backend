// payment.model.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    customId: Number,
    nameOfVisitor: String,
    mobileNumber: String,
    date: String,
    visitingPlaces: String,
    noOfDays: Number,
    noOfMembers: Number,
    totalCost: Number,
    paymentDate: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
