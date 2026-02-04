const express = require('express');
const Book = require('../models/book');

const router = express.Router();

// API endpoint to add a new booking
router.post('/add', async (req, res) => {  // Use router.post() here
  const bookDetails = req.body;
  const newBook = new Book(bookDetails);

  try {
      await newBook.save();
      res.status(200).json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to get all bookings for a specific username (where visitor name == signed-in username)
router.get('/getall/:username', async (req, res) => {
  const signedInUsername = req.params.username;

  try {
    const bookings = await Book.find({ nameOfVisitor: signedInUsername });
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
