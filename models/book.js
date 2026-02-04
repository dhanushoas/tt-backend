// models/book.js
const mongoose = require('mongoose');

const bookingsSchema = new mongoose.Schema({
  customId: String,
  nameOfVisitor: String,
  mobileNumber: Number,
  date: String,
  visitingPlaces: String,
  noOfDays: Number,
  noOfMembers: Number,
  totalCost: Number,
  username:String,
});

const Book = mongoose.model('Book', bookingsSchema);

module.exports = Book;
