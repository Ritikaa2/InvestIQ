const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { sendPasswordResetOtp } = require('../services/emailService');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const RESET_OTP_EXPIRES_MINUTES = Number(process.env.RESET_OTP_EXPIRES_MINUTES || 10);

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

module.exports = {
  register: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const [existingUser] = await db.query(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );
      if (existingUser && existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with that email or username already exists.'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Save user to DB
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
      const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });
      
      const [result] = await db.query(
        'INSERT INTO users (username, email, password_hash, avatar_url, is_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, passwordHash, avatarUrl, false, verificationToken]
      );

      const userId = result.insertId;

      // Automatically create settings row for the user
      await db.query(
        'INSERT INTO settings (user_id, theme, language, notifications_enabled) VALUES (?, ?, ?, ?)',
        [userId, 'dark', 'en', true]
      );

      // Create JWT
      const token = jwt.sign({ id: userId, username, email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });

      return res.status(210).json({
        success: true,
        message: 'Registration successful! Verification email sent (simulated).',
        token,
        user: { id: userId, username, email, avatar_url: avatarUrl, is_verified: false }
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find user
      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (!users || users.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const user = users[0];

      // Match password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Create JWT token
      const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });

      return res.json({
        success: true,
        message: 'Log in successful.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          is_verified: Boolean(user.is_verified)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  verifyEmail: async (req, res, next) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: 'Token parameter is required.' });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Verification link expired or invalid.' });
      }

      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [decoded.email]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const user = users[0];
      if (user.is_verified) {
        return res.json({ success: true, message: 'Email already verified.' });
      }

      await db.query('UPDATE users SET is_verified = ? WHERE id = ?', [true, user.id]);
      
      // Send a welcoming notification
      await db.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [user.id, 'Welcome to InvestIQ!', 'Your email verification is complete. Explore AI investment models.']
      );

      return res.json({ success: true, message: 'Email address verified successfully!' });
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      const [users] = await db.query('SELECT id, username, email FROM users WHERE email = ?', [email]);
      if (!users || users.length === 0) {
        return res.json({
          success: true,
          message: 'If an account exists for this email, an OTP has been sent.'
        });
      }

      const user = users[0];
      const otp = generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + RESET_OTP_EXPIRES_MINUTES);

      await db.query(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [`otp:${otpHash}`, expires, user.id]
      );

      const emailResult = await sendPasswordResetOtp({
        to: user.email || email,
        username: user.username,
        otp,
        expiresMinutes: RESET_OTP_EXPIRES_MINUTES
      });

      const response = {
        success: true,
        message: emailResult.sent
          ? 'Password reset OTP sent to your email.'
          : 'Password reset OTP generated. Configure Gmail SMTP credentials to send it by email.'
      };

      if (!emailResult.sent && process.env.NODE_ENV !== 'production') {
        response.devOtp = otp;
      }

      return res.json(response);
    } catch (error) {
      next(error);
    }
  },

  verifyResetOtp: async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      const [users] = await db.query('SELECT id, reset_token, reset_token_expires FROM users WHERE email = ?', [email]);
      const user = users && users[0];

      if (!user || !user.reset_token || !String(user.reset_token).startsWith('otp:')) {
        return res.status(400).json({ success: false, message: 'OTP is invalid or expired.' });
      }

      if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      }

      const isMatch = await bcrypt.compare(String(otp), String(user.reset_token).slice(4));
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'OTP is invalid or expired.' });
      }

      return res.json({ success: true, message: 'OTP verified successfully.' });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { email, otp, token, password } = req.body;
      if (!password) {
        return res.status(400).json({ success: false, message: 'New password is required.' });
      }

      if (email && otp) {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users && users[0];

        if (!user || !user.reset_token || !String(user.reset_token).startsWith('otp:')) {
          return res.status(400).json({ success: false, message: 'OTP is invalid or expired.' });
        }

        if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
          return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        const isMatch = await bcrypt.compare(String(otp), String(user.reset_token).slice(4));
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'OTP is invalid or expired.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db.query(
          'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
          [passwordHash, user.id]
        );

        return res.json({ success: true, message: 'Password has been reset successfully.' });
      }

      if (!token) {
        return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Reset token is invalid or expired.' });
      }

      const [users] = await db.query(
        'SELECT * FROM users WHERE id = ? AND reset_token = ?',
        [decoded.id, token]
      );
      if (!users || users.length === 0) {
        return res.status(400).json({ success: false, message: 'Token is invalid or has already been used.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      await db.query(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [passwordHash, decoded.id]
      );

      return res.json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
      next(error);
    }
  },
  getProfile: async (req, res, next) => {
    try {
      const [users] = await db.query(
        'SELECT id, username, email, avatar_url, is_verified, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
      
      const [settings] = await db.query('SELECT theme, language, notifications_enabled FROM settings WHERE user_id = ?', [req.user.id]);
      
      const [notifs] = await db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [req.user.id]);

      return res.json({
        success: true,
        profile: users[0],
        settings: settings[0] || { theme: 'dark', language: 'en', notifications_enabled: true },
        notifications: notifs
      });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      let avatarUrl = req.user.avatar_url;

      // Handle file upload
      if (req.file) {
        // In local production we will store file path or simple URL
        avatarUrl = `/uploads/${req.file.filename}`;
      }

      // Update fields
      if (username) {
        // check uniqueness if username changed
        if (username !== req.user.username) {
          const [exists] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
          if (exists && exists.length > 0) {
            return res.status(409).json({ success: false, message: 'Username is already taken.' });
          }
          await db.query('UPDATE users SET username = ? WHERE id = ?', [username, req.user.id]);
        }
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, req.user.id]);
      }

      if (req.file) {
        await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);
      }

      const [updated] = await db.query('SELECT id, username, email, avatar_url FROM users WHERE id = ?', [req.user.id]);

      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: updated[0]
      });
    } catch (error) {
      next(error);
    }
  }
};



