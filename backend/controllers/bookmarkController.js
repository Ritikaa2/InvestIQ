const db = require('../config/db');

module.exports = {
  addBookmark: async (req, res, next) => {
    try {
      const { ticker, company_name } = req.body;
      if (!ticker || !company_name) {
        return res.status(400).json({ success: false, message: 'Ticker and company name are required.' });
      }

      const tickerUpper = ticker.toUpperCase().trim();

      // Check if already bookmarked
      const [exists] = await db.query(
        'SELECT id FROM bookmarks WHERE user_id = ? AND ticker = ?',
        [req.user.id, tickerUpper]
      );

      if (exists && exists.length > 0) {
        return res.status(409).json({ success: false, message: 'Company is already bookmarked.' });
      }

      const [result] = await db.query(
        'INSERT INTO bookmarks (user_id, company_name, ticker) VALUES (?, ?, ?)',
        [req.user.id, company_name, tickerUpper]
      );

      return res.status(201).json({
        success: true,
        message: 'Bookmark added successfully.',
        bookmark: {
          id: result.insertId,
          user_id: req.user.id,
          company_name,
          ticker: tickerUpper
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getBookmarks: async (req, res, next) => {
    try {
      const [rows] = await db.query('SELECT * FROM bookmarks WHERE user_id = ?', [req.user.id]);
      return res.json({ success: true, bookmarks: rows });
    } catch (error) {
      next(error);
    }
  },

  removeBookmark: async (req, res, next) => {
    try {
      const { id } = req.params;
      const [result] = await db.query(
        'DELETE FROM bookmarks WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Bookmark not found.' });
      }

      return res.json({ success: true, message: 'Bookmark removed successfully.' });
    } catch (error) {
      next(error);
    }
  }
};
