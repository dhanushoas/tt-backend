const mongoose = require('mongoose');
const Image = require('./models/image'); // Adjust path as needed
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test_db';

async function checkImages() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const images = await Image.find({}, 'name location');
        console.log(`Total images: ${images.length}`);

        const searchTerms = ['tamilnadu', 'temple', 'education'];

        for (const term of searchTerms) {
            const regex = new RegExp(`^${term}(\\..+)?$`, 'i');
            const found = await Image.findOne({ name: { $regex: regex } });
            console.log(`Search '${term}' (Regex: ${regex}): ${found ? 'FOUND (' + found.name + ')' : 'NOT FOUND'}`);
        }

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkImages();
