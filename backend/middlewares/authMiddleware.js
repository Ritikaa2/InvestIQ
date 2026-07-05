const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production');
    
    // Fetch user details from database to append to req
    const [rows] = await db.query('SELECT id, username, email, avatar_url, is_verified FROM users WHERE id = ?', [decoded.id]);
    
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Access denied. User no longer exists.' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid or tampered authentication token.' });
  }
};
