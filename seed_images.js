const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const ASSETS_DIR = path.join(__dirname, '../UI/src/assets');
const API_URL = 'http://localhost:3000/image/upload';

async function seedImages() {
    try {
        const files = fs.readdirSync(ASSETS_DIR);

        for (const file of files) {
            const fullPath = path.join(ASSETS_DIR, file);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                const location = file; // The directory name is the location
                console.log(`Processing location: ${location}`);

                const locationFiles = fs.readdirSync(fullPath);
                for (const imageFile of locationFiles) {
                    await uploadFile(path.join(fullPath, imageFile), imageFile, location);
                }
            } else {
                // Handle files in the root assets directory
                const imageFile = file;
                const location = 'General'; // Default location for root files
                console.log(`Processing root file: ${imageFile}`);
                await uploadFile(fullPath, imageFile, location);
            }
            // End of script

            async function uploadFile(statusCode, imageFile, location) {
                // Skip hidden files or non-images
                if (imageFile.startsWith('.')) return;

                // Prepare form data
                const form = new FormData();
                form.append('name', imageFile); // Use filename as the name
                form.append('location', location);
                form.append('image', fs.createReadStream(statusCode));

                try {
                    await axios.post(API_URL, form, {
                        headers: {
                            ...form.getHeaders()
                        }
                    });
                    console.log(`Uploaded: ${imageFile} to ${location}`);
                } catch (err) {
                    console.error(`Failed to upload ${imageFile}:`, err.message);
                }
            }
        }
        console.log('Seeding completed!');
    } catch (error) {
        console.error('Error seeding images:', error);
    }
}

seedImages();
