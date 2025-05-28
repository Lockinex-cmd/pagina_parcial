const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken'); // For issuing our own JWT after Google auth

dotenv.config();

const dbPool = require('./config/db');
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
    // This is the verify callback
    // console.log('Google profile:', profile);
    const googleId = profile.id;
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    const username = profile.displayName || email || googleId; // Fallback for username

    if (!email) {
        return done(new Error('Email not provided by Google.'), null);
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        // Check if user exists by Google ID or email
        let [users] = await connection.execute(
            'SELECT * FROM usuarios WHERE google_id = ? OR user_mail = ?',
            [googleId, email]
        );

        let user = users[0];

        if (!user) {
            // User doesn't exist, create a new one
            // We don't have a password, so we can store a placeholder or leave it null if your schema allows
            // For simplicity, we'll use a generated username if needed and store google_id
            const [result] = await connection.execute(
                'INSERT INTO usuarios (username, user_mail, google_id) VALUES (?, ?, ?)',
                [username, email, googleId]
            );
            // Fetch the newly created user
            [users] = await connection.execute('SELECT * FROM usuarios WHERE user_id = ?', [result.insertId]);
            user = users[0];
        } else if (!user.google_id) {
            // User exists by email but not linked to Google yet, link them
            await connection.execute(
                'UPDATE usuarios SET google_id = ? WHERE user_id = ?',
                [googleId, user.user_id]
            );
            user.google_id = googleId; // Update in-memory user object
        }
        
        return done(null, user); // Pass the user object to the callback route
    } catch (err) {
        return done(err, null);
    } finally {
        if (connection) connection.release();
    }
  }
));

// We are not using Express sessions for JWT, so serialize/deserialize can be minimal
// If you were using sessions, these would be more critical.
passport.serializeUser((user, done) => {
    done(null, user.user_id); // Or user.id if that's your primary key
});

passport.deserializeUser(async (id, done) => {
    let connection;
    try {
        connection = await dbPool.getConnection();
        const [users] = await connection.execute('SELECT * FROM usuarios WHERE user_id = ?', [id]);
        done(null, users[0]);
    } catch (err) {
        done(err, null);
    } finally {
        if (connection) connection.release();
    }
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