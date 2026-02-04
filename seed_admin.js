const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/admin');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test_db';

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const existingAdmin = await Admin.findOne({ adminname: 'Admin' });
        if (existingAdmin) {
            console.log('Admin already exists');
        } else {
            const hashedPassword = await bcrypt.hash('Admin@321', 10);
            const admin = new Admin({
                adminname: 'Admin',
                gmailId: 'admin@gmail.com',
                password: hashedPassword,
                dob: new Date('1990-01-01')
            });
            await admin.save();
            console.log('Admin created: Admin / Admin@321');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error seeding admin:', err);
    }
}

seedAdmin();
