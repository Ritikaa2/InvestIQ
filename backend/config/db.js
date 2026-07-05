const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool = null;
let fallbackDb = null;
const fallbackFilePath = path.join(__dirname, '..', 'database', 'investiq.local.json');

// Initialize local JSON database for fallback
function initFallbackDb() {
  if (!fs.existsSync(path.dirname(fallbackFilePath))) {
    fs.mkdirSync(path.dirname(fallbackFilePath), { recursive: true });
  }

  if (fs.existsSync(fallbackFilePath)) {
    try {
      fallbackDb = JSON.parse(fs.readFileSync(fallbackFilePath, 'utf8'));
    } catch (e) {
      console.error('Error reading fallback DB file, resetting:', e);
      fallbackDb = getDefaultFallbackData();
      saveFallbackDb();
    }
  } else {
    fallbackDb = getDefaultFallbackData();
    saveFallbackDb();
  }
}

function getDefaultFallbackData() {
  return {
    users: [],
    settings: [],
    research_history: [],
    investment_reports: [],
    saved_reports: [],
    bookmarks: [],
    notifications: [],
    api_logs: [],
    company_cache: []
  };
}

function saveFallbackDb() {
  try {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(fallbackDb, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing fallback DB file:', e);
  }
}

// Fallback Query Engine simulating basic MySQL queries
const fallbackQueryEngine = {
  query: async (sql, params = []) => {
    return fallbackQueryEngine.execute(sql, params);
  },
  execute: async (sql, params = []) => {
    if (!fallbackDb) initFallbackDb();
    
    const queryClean = sql.replace(/\s+/g, ' ').trim();
    
    // 1. INSERT INTO users
    if (queryClean.match(/INSERT INTO users/i)) {
      const [username, email, password_hash, avatar_url, is_verified] = params;
      const newUser = {
        id: fallbackDb.users.length + 1,
        username,
        email,
        password_hash,
        avatar_url: avatar_url || null,
        is_verified: is_verified || false,
        verification_token: params[5] || null,
        reset_token: null,
        reset_token_expires: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      fallbackDb.users.push(newUser);
      
      // Auto-create settings for new user
      fallbackDb.settings.push({
        id: fallbackDb.settings.length + 1,
        user_id: newUser.id,
        theme: 'dark',
        language: 'en',
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      saveFallbackDb();
      return [{ insertId: newUser.id }];
    }

    // 2. SELECT FROM users
    if (queryClean.match(/SELECT id FROM users WHERE email = \? OR username = \?/i)) {
      const [email, username] = params;
      const users = fallbackDb.users
        .filter(u => u.email === email || u.username === username)
        .map(u => ({ id: u.id }));
      return [users];
    }
    if (queryClean.match(/SELECT id, username, email FROM users WHERE email = \?/i)) {
      const user = fallbackDb.users.find(u => u.email === params[0]);
      return [user ? [{ id: user.id, username: user.username, email: user.email }] : []];
    }
    if (queryClean.match(/SELECT id, reset_token, reset_token_expires FROM users WHERE email = \?/i)) {
      const user = fallbackDb.users.find(u => u.email === params[0]);
      return [user ? [{ id: user.id, reset_token: user.reset_token, reset_token_expires: user.reset_token_expires }] : []];
    }
    if (queryClean.match(/SELECT \* FROM users WHERE email = \?/i)) {
      const user = fallbackDb.users.find(u => u.email === params[0]);
      return [user ? [user] : []];
    }
    if (queryClean.match(/SELECT \* FROM users WHERE username = \?/i)) {
      const user = fallbackDb.users.find(u => u.username === params[0]);
      return [user ? [user] : []];
    }
    if (queryClean.match(/SELECT \* FROM users WHERE id = \?/i)) {
      const user = fallbackDb.users.find(u => u.id === parseInt(params[0]));
      return [user ? [user] : []];
    }

    if (queryClean.match(/SELECT \* FROM users WHERE id = \? AND reset_token = \?/i)) {
      const [id, resetToken] = params;
      const user = fallbackDb.users.find(u => u.id === parseInt(id) && u.reset_token === resetToken);
      return [user ? [user] : []];
    }

    // 3. UPDATE users (avatar / profile / reset tokens)
    if (queryClean.match(/UPDATE users SET avatar_url = \?/i)) {
      const [avatar_url, userId] = params;
      const user = fallbackDb.users.find(u => u.id === parseInt(userId));
      if (user) {
        user.avatar_url = avatar_url;
        user.updated_at = new Date().toISOString();
        saveFallbackDb();
      }
      return [{ affectedRows: user ? 1 : 0 }];
    }
    if (queryClean.match(/UPDATE users SET reset_token = \?, reset_token_expires = \? WHERE id = \?/i)) {
      const [reset_token, reset_token_expires, userId] = params;
      const user = fallbackDb.users.find(u => u.id === parseInt(userId));
      if (user) {
        user.reset_token = reset_token;
        user.reset_token_expires = reset_token_expires instanceof Date ? reset_token_expires.toISOString() : reset_token_expires;
        user.updated_at = new Date().toISOString();
        saveFallbackDb();
      }
      return [{ affectedRows: user ? 1 : 0 }];
    }
    if (queryClean.match(/UPDATE users SET password_hash = \?/i)) {
      const [password_hash, userId] = params;
      const user = fallbackDb.users.find(u => u.id === parseInt(userId));
      if (user) {
        user.password_hash = password_hash;
        if (queryClean.includes('reset_token = NULL')) {
          user.reset_token = null;
          user.reset_token_expires = null;
        }
        user.updated_at = new Date().toISOString();
        saveFallbackDb();
      }
      return [{ affectedRows: user ? 1 : 0 }];
    }

    // 4. SELECT settings
    if (queryClean.match(/SELECT \* FROM settings WHERE user_id = \?/i)) {
      const setting = fallbackDb.settings.find(s => s.user_id === parseInt(params[0]));
      return [setting ? [setting] : []];
    }

    // 5. UPDATE settings
    if (queryClean.match(/UPDATE settings SET theme = \?, language = \?, notifications_enabled = \?/i)) {
      const [theme, language, notifications_enabled, user_id] = params;
      let setting = fallbackDb.settings.find(s => s.user_id === parseInt(user_id));
      if (!setting) {
        setting = { user_id: parseInt(user_id) };
        fallbackDb.settings.push(setting);
      }
      setting.theme = theme;
      setting.language = language;
      setting.notifications_enabled = Boolean(notifications_enabled);
      setting.updated_at = new Date().toISOString();
      saveFallbackDb();
      return [{ affectedRows: 1 }];
    }

    // 6. INSERT INTO research_history
    if (queryClean.match(/INSERT INTO research_history/i)) {
      const [user_id, company_name, ticker, status, response_time_ms, tokens_used] = params;
      const newHistory = {
        id: fallbackDb.research_history.length + 1,
        user_id: parseInt(user_id),
        company_name,
        ticker,
        status: status || 'pending',
        response_time_ms: response_time_ms || 0,
        tokens_used: tokens_used || 0,
        created_at: new Date().toISOString()
      };
      fallbackDb.research_history.push(newHistory);
      saveFallbackDb();
      return [{ insertId: newHistory.id }];
    }

    // 7. UPDATE research_history
    if (queryClean.match(/UPDATE research_history SET status = \?, response_time_ms = \?, tokens_used = \?/i)) {
      const [status, response_time_ms, tokens_used, id] = params;
      const history = fallbackDb.research_history.find(h => h.id === parseInt(id));
      if (history) {
        history.status = status;
        history.response_time_ms = parseInt(response_time_ms);
        history.tokens_used = parseInt(tokens_used);
        saveFallbackDb();
      }
      return [{ affectedRows: history ? 1 : 0 }];
    }

    // 8. SELECT FROM research_history
    if (queryClean.match(/SELECT \* FROM research_history WHERE user_id = \?/i)) {
      const historyItems = fallbackDb.research_history
        .filter(h => h.user_id === parseInt(params[0]))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [historyItems];
    }

    // 9. INSERT INTO investment_reports
    if (queryClean.match(/INSERT INTO investment_reports/i)) {
      const [history_id, user_id, company_name, ticker, report_data, investment_score, recommendation, ai_summary] = params;
      const newReport = {
        id: fallbackDb.investment_reports.length + 1,
        history_id: parseInt(history_id),
        user_id: parseInt(user_id),
        company_name,
        ticker,
        report_data,
        investment_score: parseInt(investment_score),
        recommendation,
        ai_summary,
        created_at: new Date().toISOString()
      };
      fallbackDb.investment_reports.push(newReport);
      saveFallbackDb();
      return [{ insertId: newReport.id }];
    }

    // 10. SELECT report_data
    if (queryClean.match(/SELECT \* FROM investment_reports WHERE id = \?/i)) {
      const report = fallbackDb.investment_reports.find(r => r.id === parseInt(params[0]));
      return [report ? [report] : []];
    }
    if (queryClean.match(/SELECT \* FROM investment_reports WHERE history_id = \?/i)) {
      const report = fallbackDb.investment_reports.find(r => r.history_id === parseInt(params[0]));
      return [report ? [report] : []];
    }
    if (queryClean.match(/SELECT \* FROM investment_reports WHERE user_id = \?/i)) {
      const reports = fallbackDb.investment_reports.filter(r => r.user_id === parseInt(params[0]));
      return [reports];
    }

    // 11. DELETE FROM investment_reports
    if (queryClean.match(/DELETE FROM investment_reports WHERE id = \?/i)) {
      const id = parseInt(params[0]);
      const initialLength = fallbackDb.investment_reports.length;
      fallbackDb.investment_reports = fallbackDb.investment_reports.filter(r => r.id !== id);
      saveFallbackDb();
      return [{ affectedRows: initialLength - fallbackDb.investment_reports.length }];
    }

    // 12. Bookmarks
    if (queryClean.match(/INSERT INTO bookmarks/i)) {
      const [user_id, company_name, ticker] = params;
      const exists = fallbackDb.bookmarks.find(b => b.user_id === parseInt(user_id) && b.ticker === ticker);
      if (exists) return [{ affectedRows: 0 }];
      const newBookmark = {
        id: fallbackDb.bookmarks.length + 1,
        user_id: parseInt(user_id),
        company_name,
        ticker,
        created_at: new Date().toISOString()
      };
      fallbackDb.bookmarks.push(newBookmark);
      saveFallbackDb();
      return [{ insertId: newBookmark.id }];
    }
    if (queryClean.match(/SELECT \* FROM bookmarks WHERE user_id = \?/i)) {
      const bookmarks = fallbackDb.bookmarks.filter(b => b.user_id === parseInt(params[0]));
      return [bookmarks];
    }
    if (queryClean.match(/DELETE FROM bookmarks WHERE user_id = \? AND ticker = \?/i)) {
      const [user_id, ticker] = params;
      const initialLength = fallbackDb.bookmarks.length;
      fallbackDb.bookmarks = fallbackDb.bookmarks.filter(b => !(b.user_id === parseInt(user_id) && b.ticker === ticker));
      saveFallbackDb();
      return [{ affectedRows: initialLength - fallbackDb.bookmarks.length }];
    }
    if (queryClean.match(/DELETE FROM bookmarks WHERE id = \? AND user_id = \?/i)) {
      const [id, user_id] = params;
      const initialLength = fallbackDb.bookmarks.length;
      fallbackDb.bookmarks = fallbackDb.bookmarks.filter(b => !(b.id === parseInt(id) && b.user_id === parseInt(user_id)));
      saveFallbackDb();
      return [{ affectedRows: initialLength - fallbackDb.bookmarks.length }];
    }

    // 13. Notifications
    if (queryClean.match(/INSERT INTO notifications/i)) {
      const [user_id, title, message] = params;
      const newNotif = {
        id: fallbackDb.notifications.length + 1,
        user_id: parseInt(user_id),
        title,
        message,
        is_read: false,
        created_at: new Date().toISOString()
      };
      fallbackDb.notifications.push(newNotif);
      saveFallbackDb();
      return [{ insertId: newNotif.id }];
    }
    if (queryClean.match(/SELECT \* FROM notifications WHERE user_id = \?/i)) {
      const notifs = fallbackDb.notifications
        .filter(n => n.user_id === parseInt(params[0]))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [notifs];
    }
    if (queryClean.match(/UPDATE notifications SET is_read = 1 WHERE user_id = \?/i)) {
      const userId = parseInt(params[0]);
      fallbackDb.notifications.forEach(n => {
        if (n.user_id === userId) n.is_read = true;
      });
      saveFallbackDb();
      return [{ affectedRows: 1 }];
    }

    // 14. API Logs
    if (queryClean.match(/INSERT INTO api_logs/i)) {
      const [user_id, endpoint, method, status_code, response_time_ms, ip_address] = params;
      const newLog = {
        id: fallbackDb.api_logs.length + 1,
        user_id: user_id ? parseInt(user_id) : null,
        endpoint,
        method,
        status_code: parseInt(status_code),
        response_time_ms: parseInt(response_time_ms),
        ip_address,
        created_at: new Date().toISOString()
      };
      fallbackDb.api_logs.push(newLog);
      saveFallbackDb();
      return [{ insertId: newLog.id }];
    }
    if (queryClean.match(/SELECT \* FROM api_logs/i)) {
      return [fallbackDb.api_logs];
    }

    // 15. Saved Reports
    if (queryClean.match(/INSERT INTO saved_reports/i)) {
      const [user_id, report_id] = params;
      const exists = fallbackDb.saved_reports.find(sr => sr.user_id === parseInt(user_id) && sr.report_id === parseInt(report_id));
      if (exists) return [{ affectedRows: 0 }];
      const newSaved = {
        id: fallbackDb.saved_reports.length + 1,
        user_id: parseInt(user_id),
        report_id: parseInt(report_id),
        created_at: new Date().toISOString()
      };
      fallbackDb.saved_reports.push(newSaved);
      saveFallbackDb();
      return [{ insertId: newSaved.id }];
    }
    if (queryClean.match(/SELECT sr\.\*, ir\..* FROM saved_reports sr JOIN investment_reports/i)) {
      const userId = parseInt(params[0]);
      const savedItems = fallbackDb.saved_reports.filter(sr => sr.user_id === userId);
      const output = savedItems.map(sr => {
        const report = fallbackDb.investment_reports.find(ir => ir.id === sr.report_id);
        return {
          id: sr.id,
          user_id: sr.user_id,
          report_id: sr.report_id,
          created_at: sr.created_at,
          company_name: report ? report.company_name : '',
          ticker: report ? report.ticker : '',
          investment_score: report ? report.investment_score : 50,
          recommendation: report ? report.recommendation : 'HOLD',
          ai_summary: report ? report.ai_summary : ''
        };
      });
      return [output];
    }
    if (queryClean.match(/DELETE FROM saved_reports WHERE user_id = \? AND report_id = \?/i)) {
      const [user_id, report_id] = params;
      const initialLength = fallbackDb.saved_reports.length;
      fallbackDb.saved_reports = fallbackDb.saved_reports.filter(sr => !(sr.user_id === parseInt(user_id) && sr.report_id === parseInt(report_id)));
      saveFallbackDb();
      return [{ affectedRows: initialLength - fallbackDb.saved_reports.length }];
    }
    if (queryClean.match(/DELETE FROM saved_reports WHERE id = \? AND user_id = \?/i)) {
      const [id, user_id] = params;
      const initialLength = fallbackDb.saved_reports.length;
      fallbackDb.saved_reports = fallbackDb.saved_reports.filter(sr => !(sr.id === parseInt(id) && sr.user_id === parseInt(user_id)));
      saveFallbackDb();
      return [{ affectedRows: initialLength - fallbackDb.saved_reports.length }];
    }

    // Default empty return
    console.warn(`Unmatched query in fallback DB engine: "${queryClean}". Parameters:`, params);
    return [[]];
  }
};

async function connectDb() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'investiq',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  try {
    console.log(`Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}...`);
    pool = mysql.createPool(dbConfig);
    // Ping to verify connection
    const conn = await pool.getConnection();
    console.log('Successfully connected to MySQL database.');
    conn.release();
    return pool;
  } catch (error) {
    console.warn('\n======================================================');
    console.warn('WARNING: MySQL Connection failed.');
    console.warn(error.message);
    console.warn('Falling back to localized JSON DB storage. All functions remain active.');
    console.warn('======================================================\n');
    initFallbackDb();
    pool = fallbackQueryEngine;
    return pool;
  }
}

module.exports = {
  getDb: async () => {
    if (!pool) {
      await connectDb();
    }
    return pool;
  },
  // Direct access to query helper
  query: async (sql, params) => {
    if (!pool) await connectDb();
    return pool.query(sql, params);
  },
  execute: async (sql, params) => {
    if (!pool) await connectDb();
    return pool.execute(sql, params);
  }
};



