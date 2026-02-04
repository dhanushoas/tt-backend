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

            // Check if it's double-quoted (string inside string)
            if (serviceAccountStr.startsWith('"') && serviceAccountStr.endsWith('"')) {
                try {
                    serviceAccountStr = JSON.parse(serviceAccountStr); // Unwrap one layer
                    console.log('Double-unwrapped service account string.');
                } catch (e) {
                    console.warn('Could not unwrap potentially double-quoted string');
                }
            }
        }

        const serviceAccount = typeof serviceAccountStr === 'string'
            ? JSON.parse(serviceAccountStr)
            : serviceAccountStr;

        if (!serviceAccount.project_id || !serviceAccount.private_key) {
            throw new Error('Parsed JSON does not look like a Service Account (missing project_id or private_key)');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin Initialized with FIREBASE_SERVICE_ACCOUNT Env Var');
    } catch (error) {
        console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT:', error.message);
        const envVal = process.env.FIREBASE_SERVICE_ACCOUNT || '';
        console.error(`Env Var Length: ${envVal.length}`);
        console.error('First 100 chars of env var:', envVal.substring(0, 100));
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
