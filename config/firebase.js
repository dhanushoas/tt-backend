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
        console.log('Attempting to parse FIREBASE_SERVICE_ACCOUNT env var...');
        let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

        // Handle potential double-escaped newlines from some env var injection systems
        if (typeof serviceAccountStr === 'string') {
            serviceAccountStr = serviceAccountStr.replace(/\\n/g, '\n');
        }

        const serviceAccount = JSON.parse(serviceAccountStr);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin Initialized with FIREBASE_SERVICE_ACCOUNT Env Var');
    } catch (error) {
        console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT:', error.message);
        console.error('First 50 chars of env var:', process.env.FIREBASE_SERVICE_ACCOUNT ? process.env.FIREBASE_SERVICE_ACCOUNT.substring(0, 50) : 'N/A');
    }
} else if (fs.existsSync(serviceAccountPath)) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        });
        console.log('✅ Firebase Admin Initialized with local file');
    } catch (error) {
        console.error('❌ Error initializing from local file:', error);
    }
} else {
    console.warn('\x1b[31m[WARNING] Firebase Admin NOT initialized.\x1b[0m');
    console.warn('Reason: No FIREBASE_SERVICE_ACCOUNT env var and no local firebase-service-account.json found.');
}

module.exports = admin;
