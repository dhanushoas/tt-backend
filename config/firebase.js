const admin = require('firebase-admin');

// You need to generate a Private Key JSON file from Firebase Console
// Project Settings -> Service Accounts -> Generate New Private Key
// Save it as 'firebase-service-account.json' in the API/config directory
// OR set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of the file

const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin Initialized with FIREBASE_SERVICE_ACCOUNT Env Var');
    } catch (error) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
    }
} else if (fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
    console.log('Firebase Admin Initialized with local file');
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
    console.log('Firebase Admin Initialized with Env Var (Path)');
} else {
    console.warn('\x1b[31m[WARNING] Firebase Admin NOT initialized.\x1b[0m');
    console.warn('Please download the Service Account Key from Firebase Console -> Project Settings -> Service Accounts');
    console.warn(`Save it as: \x1b[33m${serviceAccountPath}\x1b[0m`);
}

module.exports = admin;
