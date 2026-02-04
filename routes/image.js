const express = require('express');
const multer = require('multer');
const Image = require('../models/image');

const imageStorage = multer.memoryStorage();
const imageUpload = multer({ storage: imageStorage });

const router = express.Router();


// 🔹 Get Image by Name (NEW Endpoint)
router.get('/getImageByName/:imageName', async (req, res) => {
  try {
    // URL decode the imageName to handle spaces/special characters
    const decodedName = decodeURIComponent(req.params.imageName);
    // Regex to match exact name OR name followed by dot and extension, case insensitive
    const image = await Image.findOne({ name: { $regex: new RegExp(`^${decodedName}(\\..+)?$`, 'i') } });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image Upload Route
router.post('/upload', imageUpload.single('image'), async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name) {
      return res.status(400).send('Please provide a name for the image.');
    }

    if (!location) {
      return res.status(400).send('Please provide a location for the image.');
    }

    const image = new Image({
      name: name,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      location: location,
    });

    await image.save();

    // Change the response in the upload route to send a JSON object
    res.status(201).json({ message: 'Image uploaded successfully!' });

  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get Images by Location Route
router.get('/getImages/:location', async (req, res) => {
  const imageLocation = req.params.location;

  try {
    const images = await Image.find({ location: { $regex: new RegExp(`^${imageLocation}$`, 'i') } }, { _id: 0, name: 1, location: 1 });

    if (images.length === 0) {
      return res.status(404).send('No images found for the specified location');
    }

    res.json(images);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get Image by Name Route
router.get('/images/:imageName', async (req, res) => {
  const imageName = req.params.imageName;

  try {
    // URL decode the imageName
    const decodedName = decodeURIComponent(imageName);
    const image = await Image.findOne({ name: { $regex: new RegExp(`^${decodedName}(\\..+)?$`, 'i') } });

    if (!image) {
      return res.status(404).send('Image not found');
    }

    res.type(image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Add a new route for updating image details
router.put('/images/:imageName', async (req, res) => {
  const imageName = req.params.imageName;
  const { newName, newLocation } = req.body;

  try {
    const image = await Image.findOneAndUpdate(
      { name: imageName },
      { $set: { name: newName, location: newLocation } },
      { new: true }
    );

    if (!image) {
      return res.status(404).send('Image not found');
    }

    res.status(200).json(image);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Delete Image by Name Route
router.delete('/images/:imageName', async (req, res) => {
  const imageName = req.params.imageName;

  try {
    const deletedImage = await Image.findOneAndDelete({ name: imageName });

    if (!deletedImage) {
    }

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    return res.status(404).send('Image not found');
    res.status(500).send(error.message);
  }
});


module.exports = router;
