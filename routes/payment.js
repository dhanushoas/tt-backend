// payment.route.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');

router.post('/api/payments', async (req, res) => {
    try {
        const paymentDetails = req.body;

        // Create a new Payment document
        const payment = new Payment(paymentDetails);

        // Save the payment details to MongoDB
        await payment.save();

        // Send the payment details in the response
        res.json({ success: true, paymentId: payment.customId, amount: payment.totalCost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Server-side route to get books by visitor name
router.get('/payments/:nameOfVisitor', async (req, res) => {
    const { nameOfVisitor } = req.params;
  
    try {
      // Find books with matching visitor name
      const books = await Book.find({ nameOfVisitor });
  
      if (books.length === 0) {
        return res.status(404).json({ message: 'No books found for the specified visitor name.' });
      }
  
      res.json(books);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/api/payments/paidIds', async (req, res) => {
    try {
        // Fetch paid IDs from the Payment collection
        const paidPayments = await Payment.find({ /* Add criteria to filter paid payments */ });
        const paidIds = paidPayments.map(payment => payment.customId);
        res.json(paidIds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get all payments
router.get('/api/payments/all', async (req, res) => {
  try {
    // Fetch all payments from the Payment collection
    const allPayments = await Payment.find();
    
    // Send the payments in the response
    res.json({ success: true, payments: allPayments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
