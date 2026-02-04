const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  gmailId: { type: String, unique: true },
  googleId: String,
  dob: Date,
  password: String,
  registrationTime: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
