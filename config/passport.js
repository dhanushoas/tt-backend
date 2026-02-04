const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
            callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({ googleId: profile.id });
                if (existingUser) {
                    return done(null, existingUser);
                }

                // Check if user exists with the same email
                const existingEmailUser = await User.findOne({ gmailId: profile.emails[0].value });
                if (existingEmailUser) {
                    // Update existing user with googleId
                    existingEmailUser.googleId = profile.id;
                    await existingEmailUser.save();
                    return done(null, existingEmailUser);
                }

                // Create new user
                const newUser = await new User({
                    username: profile.displayName,
                    gmailId: profile.emails[0].value,
                    googleId: profile.id,
                }).save();
                done(null, newUser);
            } catch (error) {
                console.error('Error during Google Auth:', error);
                done(error, null);
            }
        }
    )
);

// Check if keys are set
if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
    console.warn('\n\x1b[31m[WARNING] Google Client ID is missing or invalid. Real Google Login will NOT work.\x1b[0m');
    console.warn('\x1b[33mPlease add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.\x1b[0m\n');
}
