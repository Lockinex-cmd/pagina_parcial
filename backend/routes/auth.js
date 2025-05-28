const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport'); // Import passport
const dbPool = require('../config/db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file.");
    process.exit(1);
}

// Registration Route
router.post('/register', async (req, res) => {
    // Use the names sent from the frontend form
    const { 'register-username': username, 'register-email': email, 'register-password': password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();

        // Check if user or email already exists
        const [existingUsers] = await connection.execute(
            'SELECT user_id, username, user_mail FROM usuarios WHERE username = ? OR user_mail = ?',
            [username, email] // 'email' from req.body corresponds to 'user_mail'
        );

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            if (existingUser.username === username) {
                return res.status(409).json({ message: 'Username already exists.' });
            }
            if (existingUser.user_mail === email) { // Compare with user_mail
                return res.status(409).json({ message: 'Email already registered.' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await connection.execute(
            'INSERT INTO usuarios (username, user_mail, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword] // 'email' from req.body for 'user_mail' column
        );

        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });

    } catch (error) {
        console.error('Registration error:', error);
        // Check for specific MySQL errors like duplicate entry if the above check somehow fails
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username or email already exists.' });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    } finally {
        if (connection) connection.release();
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { 'login-username': loginUsername, 'login-password': loginPassword } = req.body; // Matching frontend form names

    if (!loginUsername || !loginPassword) {
        return res.status(400).json({ message: 'Please provide username/email and password.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        // Find user by username or email
        const [users] = await connection.execute(
            'SELECT user_id, username, user_mail, password FROM usuarios WHERE username = ? OR user_mail = ?',
            [loginUsername, loginUsername]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials (user not found).' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(loginPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials (password incorrect).' });
        }

        // User matched, create JWT
        const payload = {
            user: {
                id: user.user_id, // Use user_id
                username: user.username,
                email: user.user_mail // Use user_mail
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour, adjust as needed
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: 'Login successful!',
                    token,
                    user: { // Send some user info back, exclude password
                        id: user.user_id, // Use user_id
                        username: user.username,
                        email: user.user_mail // Use user_mail
                    }
                });
            }
        );

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    } finally {
        if (connection) connection.release();
    }
});

// Google OAuth Routes
// 1. Route to start Google OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// 2. Google OAuth callback route
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/?login_error=true', session: false }), // Redirect to frontend on failure
    (req, res) => {
        // Successful authentication, req.user is populated by Passport from the verify callback
        // We need to issue our own JWT for the frontend to use
        if (!req.user) {
            return res.redirect('/?login_error=true&message=Google authentication failed.');
        }

        const payload = {
            user: {
                id: req.user.user_id,
                username: req.user.username,
                email: req.user.user_mail
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) {
                    console.error('Error signing JWT after Google auth:', err);
                    return res.redirect('/?login_error=true&message=Could not sign in.');
                }
                // Send token to frontend. One way is via query parameter or by setting a cookie.
                // For simplicity with SPA, redirecting with token in hash or query.
                // Or, better, have frontend open a popup for Google auth, and then pass token back to main window.
                // For now, let's try to send it in a way the frontend can grab it.
                // We'll redirect to a page that can then store the token from URL.
                // res.json({ message: 'Google login successful!', token, user: payload.user });
                res.redirect(`/?google_auth_token=${token}&google_user=${encodeURIComponent(JSON.stringify(payload.user))}`);

            }
        );
    }
);

module.exports = router;