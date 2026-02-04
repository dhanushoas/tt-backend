// models/selectedPlace.js

const mongoose = require('mongoose');

const selectedPlaceSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  selectedPlaces: [{
    name: String,
    location: String,
    username: String,
  }],
});

const SelectedPlace = mongoose.model('SelectedPlace', selectedPlaceSchema);

module.exports = SelectedPlace;
