const db = require('../config/db');

module.exports = {
  updateSettings: async (req, res, next) => {
    try {
      const { theme, language, notifications_enabled } = req.body;
      const userId = req.user.id;

      // Update settings in database
      const [result] = await db.query(
        'UPDATE settings SET theme = ?, language = ?, notifications_enabled = ? WHERE user_id = ?',
        [theme || 'dark', language || 'en', notifications_enabled !== false ? 1 : 0, userId]
      );

      return res.json({
        success: true,
        message: 'Settings updated successfully.',
        settings: {
          theme,
          language,
          notifications_enabled: Boolean(notifications_enabled)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  deleteAccount: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // SQL cascade will automatically delete history, saved reports, settings
      await db.query('DELETE FROM users WHERE id = ?', [userId]);

      return res.json({
        success: true,
        message: 'Your account and all associated research data have been deleted.'
      });
    } catch (error) {
      next(error);
    }
  }
};
