// models/book.js
const mongoose = require('mongoose');

const bookingsSchema = new mongoose.Schema({
  customId: String,
  nameOfVisitor: String, // Full Name
  city: String,
  email: String,
  mobileNumber: String,
  monthOfVisit: String,
  budget: String,
  noOfMembers: Number, // No. of Travellers
  hotel: String,
  arrivalDepartureCity: String,
  requirement: String,
  date: String, // Keep for timestamp/creation date
  visitingPlaces: String,
  noOfDays: Number,
  totalCost: Number,
  username: String,
});

const Book = mongoose.model('Book', bookingsSchema);

module.exports = Book;
