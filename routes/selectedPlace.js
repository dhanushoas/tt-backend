const express = require('express');
const SelectedPlace = require('../models/selectedPlace');

const router = express.Router();

// Store selected places route
router.post('/store', async (req, res) => {
  const { username, location, selectedPlaces } = req.body;

  try {
    // Transform selectedPlaces array to an array of objects
    const formattedSelectedPlaces = selectedPlaces.map(place => ({
      name: place,
      location: location,
    }));

    // Use $addToSet with the formatted array
    await SelectedPlace.findOneAndUpdate(
      { username },
      { $addToSet: { selectedPlaces: formattedSelectedPlaces } },
      { upsert: true }
    );

    res.json({ success: true, message: 'Selected places stored successfully.' });
  } catch (error) {
    console.error('Error storing selected places:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all selected places route
router.get('/getall', async (req, res) => {
  const username = req.query.username; // Get the username from the query parameters

  try {
    const selectedPlaces = await SelectedPlace.findOne({ username });

    if (selectedPlaces) {
      res.json({ success: true, selectedPlaces });
    } else {
      res.json({ success: true, selectedPlaces: [] });
    }
  } catch (error) {
    console.error('Error retrieving selected places:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get selected places count route
router.get('/count', async (req, res) => {
  const { username } = req.query;

  try {
    const document = await SelectedPlace.findOne({ username });

    if (document && document.selectedPlaces) {
      const count = document.selectedPlaces.length;
      res.json({ count });
    } else {
      res.json({ count: 0 });
    }
  } catch (error) {
    console.error('Error fetching selected places count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove selected place route
router.post('/remove', async (req, res) => {
  const { username, place } = req.body;

  try {
    // Find the document with the specified username
    const userDocument = await SelectedPlace.findOne({ username });

    if (!userDocument) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Use $pull to remove the specified place from selectedPlaces array
    const updatedUserDocument = await SelectedPlace.findOneAndUpdate(
      { username },
      { $pull: { selectedPlaces: { name: place } } },
      { new: true } // Return the modified document
    );

    // Check if the selectedPlaces array is empty after removal
    if (updatedUserDocument.selectedPlaces.length === 0) {
      // Do something if the array is empty (e.g., reset other fields)
    }

    res.json({ message: `Place ${place} removed successfully.` });
  } catch (error) {
    console.error(`Error removing place ${place} from the database:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Route to delete selected places for a specific user
router.delete('/selected-places/:username', async (req, res) => {
  const { username } = req.params;

  try {
    await SelectedPlace.deleteMany({ username });
    res.json({ success: true, message: `Selected places cleared successfully for user ${username}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
