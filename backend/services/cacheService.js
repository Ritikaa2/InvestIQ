const NodeCache = require('node-cache');
const db = require('../config/db');

// Short-term memory cache (TTL: 10 minutes)
const memoryCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

module.exports = {
  // Get from memory cache
  getMem: (key) => {
    return memoryCache.get(key);
  },

  // Set in memory cache
  setMem: (key, val, ttlSeconds = 600) => {
    return memoryCache.set(key, val, ttlSeconds);
  },

  // Get from database company cache
  getDbCache: async (ticker) => {
    try {
      const tickerUpper = ticker.toUpperCase();
      const [rows] = await db.query(
        'SELECT cache_data, expires_at FROM company_cache WHERE ticker = ?',
        [tickerUpper]
      );

      if (rows && rows.length > 0) {
        const cache = rows[0];
        const now = new Date();
        const expires = new Date(cache.expires_at);

        if (now < expires) {
          return JSON.parse(cache.cache_data);
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching from database cache:', error);
      return null;
    }
  },

  // Save to database company cache
  setDbCache: async (ticker, companyName, data, ttlHours = 24) => {
    try {
      const tickerUpper = ticker.toUpperCase();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + ttlHours);
      
      const cacheDataJson = JSON.stringify(data);
      
      // INSERT ... ON DUPLICATE KEY UPDATE
      // To work with both SQLite mock and MySQL, let's try a DELETE then INSERT
      // or try ON DUPLICATE KEY UPDATE in a robust try-catch
      try {
        await db.query(
          'INSERT INTO company_cache (ticker, company_name, cache_data, expires_at) VALUES (?, ?, ?, ?) ' +
          'ON DUPLICATE KEY UPDATE company_name = ?, cache_data = ?, expires_at = ?',
          [tickerUpper, companyName, cacheDataJson, expiresAt, companyName, cacheDataJson, expiresAt]
        );
      } catch (err) {
        // Fallback for mock db queries that might not support ON DUPLICATE KEY UPDATE
        await db.query('DELETE FROM company_cache WHERE ticker = ?', [tickerUpper]);
        await db.query(
          'INSERT INTO company_cache (ticker, company_name, cache_data, expires_at) VALUES (?, ?, ?, ?)',
          [tickerUpper, companyName, cacheDataJson, expiresAt]
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error writing to database cache:', error);
      return false;
    }
  },

  // Clear memory cache
  clearMem: () => {
    memoryCache.flushAll();
  }
};
