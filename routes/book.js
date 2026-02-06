const express = require('express');
const Book = require('../models/book');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// API endpoint to add a new booking
router.post('/add', async (req, res) => {
  const bookDetails = req.body;
  const newBook = new Book(bookDetails);

  try {
    await newBook.save();

    // Send Confirmation Email
    const mailOptions = {
      from: `"TN Tourism Support" <${process.env.EMAIL_USER}>`,
      to: bookDetails.email, // Assuming email is sent in request body
      subject: 'Trip Confirmation - Tamil Nadu Tourism',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #d32f2f;">Your Trip Plan is Confirmed!</h2>
          <p>Hello <strong>${bookDetails.nameOfVisitor}</strong>,</p>
          <p>Thank you for choosing Tamil Nadu Tourism. We have received your trip plan details. Our travel consultant will contact you shortly.</p>
          
          <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; border-left: 5px solid #d32f2f;">
            <p><strong>Booking Reference:</strong> #${bookDetails.customId}</p>
            <p><strong>Planned Itinerary:</strong> ${bookDetails.visitingPlaces}</p>
            <p><strong>Travel Month:</strong> ${bookDetails.monthOfVisit}</p>
            <p><strong>Duration:</strong> ${bookDetails.noOfDays} Day(s)</p>
            <p><strong>Total Members:</strong> ${bookDetails.noOfMembers}</p>
            <p><strong>Estimated Cost:</strong> ₹${bookDetails.totalCost}</p>
          </div>

          <p>If you have any questions, feel free to contact us at support@tntourism.com.</p>
          <p>Safe travels!</p>
          <hr>
          <p style="font-size: 12px; color: #777;">Tamil Nadu Tourism Headquarters, Chennai.</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(200).json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to get all bookings for a specific username
router.get('/getall/:username', async (req, res) => {
  const signedInUsername = req.params.username;

  try {
    const bookings = await Book.find({ username: signedInUsername });
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to get all bookings for a specific email (for Google users)
router.get('/getByEmail/:email', async (req, res) => {
  const email = req.params.email;

  try {
    const bookings = await Book.find({ email: email });
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read (get a book by custom ID)
router.get('/getByCustomId/:customId', async (req, res) => {
  const customId = req.params.customId;

  try {
    const book = await Book.findOne({ customId: customId });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a book with custom ID from user
router.put('/update/:customId', async (req, res) => {
  const customId = req.params.customId;
  const updatedBookDetails = req.body;

  try {
    const updatedBook = await Book.findOneAndUpdate({ customId: customId }, updatedBookDetails, { new: true });
    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ message: 'Book updated successfully', book: updatedBook });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a book
router.delete('/delete/:customId', async (req, res) => {
  const customId = req.params.customId;

  try {
    const deletedBook = await Book.findOneAndDelete({ customId: customId });
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ message: 'Book deleted successfully', book: deletedBook });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get all bookings
router.get('/bookings/all', async (req, res) => {
  try {
    const allBookings = await Book.find();
    if (allBookings.length > 0) {
      res.json({ success: true, bookings: allBookings });
    } else {
      res.json({ success: true, message: 'No bookings found.' });
    }
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
