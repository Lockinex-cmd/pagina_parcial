const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken'); // For issuing our own JWT after Google auth
const { ObjectId } = require('mongodb'); // Import ObjectId for deserialization

dotenv.config();

const connectDB = require('./config/db'); // Updated to use MongoDB connection
const authRoutes = require('./routes/auth');

const app = express();

// Passport middleware
app.use(passport.initialize());

// Passport Google OAuth20 Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback', // Make sure this matches Google Cloud Console
    scope: ['profile', 'email'] // Request access to profile and email
  },
  async (accessToken, refreshToken, profile, done) => {
    const googleId = profile.id;
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    // Use profile.displayName or generate a username from email if displayName is not available
    const displayName = profile.displayName || (email ? email.split('@')[0] : googleId);

    if (!email) {
        return done(new Error('Email not provided by Google.'), null);
    }

    try {
        const db = await connectDB();
        const usersCollection = db.collection('usuarios');

        // Check if user exists by Google ID or email
        let user = await usersCollection.findOne({ $or: [{ google_id: googleId }, { user_mail: email }] });

        if (!user) {
            // User doesn't exist, create a new one
            const newUser = {
                username: displayName, // Use displayName or generated username
                user_mail: email,
                google_id: googleId,
                createdAt: new Date() // Optional: add a timestamp
                // No password for Google-authenticated users initially
            };
            const result = await usersCollection.insertOne(newUser);
            // Fetch the newly created user using the insertedId
            user = await usersCollection.findOne({ _id: result.insertedId });
        } else if (!user.google_id) {
            // User exists by email but not linked to Google yet, link them
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { google_id: googleId, username: user.username || displayName } } // Update google_id and ensure username exists
            );
            user.google_id = googleId; // Update in-memory user object
            user.username = user.username || displayName;
        }
        
        return done(null, user); // Pass the user object to the callback route
    } catch (err) {
        console.error('Google Strategy Error:', err);
        return done(err, null);
    }
    // No connection.release() needed for MongoDB driver
  }
));

// We are not using Express sessions for JWT, so serialize/deserialize can be minimal
// If you were using sessions, these would be more critical.
passport.serializeUser((user, done) => {
    done(null, user._id); // Use _id from MongoDB
});

passport.deserializeUser(async (id, done) => {
    try {
        const db = await connectDB();
        const usersCollection = db.collection('usuarios');
        // Ensure 'id' is converted to ObjectId for querying
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        done(null, user);
    } catch (err) {
        console.error('Deserialize User Error:', err);
        done(err, null);
    }
    // No connection.release() needed for MongoDB driver
});

app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'"], 
        "script-src-attr": ["'self'", "'unsafe-inline'"], 
        "frame-src": ["'self'", "https://scratch.mit.edu"], 
      },
    },
  })
);
app.use(morgan('dev'));
app.use(express.json()); // Middleware to parse JSON bodies

// API routes
app.use('/api/auth', authRoutes);

// Static files and frontend routes
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/tienda', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/nosotros', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/contacto', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/miCuenta', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// The database pool is now initialized in db.js and will connect automatically.
// No need for an explicit db.connect() call here.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});