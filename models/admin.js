const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminname: String,
  gmailId: { type: String, unique: true },
  dob: Date,
  password: String,
  registrationTime: { type: Date, default: Date.now },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
