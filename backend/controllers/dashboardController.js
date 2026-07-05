const db = require('../config/db');

module.exports = {
  getDashboardStats: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // 1. Core metric counts
      const [historyRows] = await db.query(
        'SELECT COUNT(*) as count, SUM(tokens_used) as tokens, AVG(response_time_ms) as avg_time ' +
        'FROM research_history WHERE user_id = ?',
        [userId]
      );
      const [bookmarkRows] = await db.query('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?', [userId]);
      const [savedRows] = await db.query('SELECT COUNT(*) as count FROM saved_reports WHERE user_id = ?', [userId]);

      const totalSearches = historyRows[0]?.count || 0;
      const tokensUsed = parseInt(historyRows[0]?.tokens) || 0;
      const avgResponseTime = Math.round(parseFloat(historyRows[0]?.avg_time) || 0);

      // 2. Recent history entries
      const [historyList] = await db.query(
        'SELECT rh.*, ir.id as report_id, ir.investment_score, ir.recommendation ' +
        'FROM research_history rh ' +
        'LEFT JOIN investment_reports ir ON rh.id = ir.history_id ' +
        'WHERE rh.user_id = ? ORDER BY rh.created_at DESC LIMIT 5',
        [userId]
      );

      // 3. Recent notifications
      const [notifications] = await db.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
        [userId]
      );

      // 4. Most searched stocks overall (simulating trending ticker list)
      const [popularRows] = await db.query(
        'SELECT ticker, company_name, COUNT(*) as searches FROM research_history ' +
        'GROUP BY ticker, company_name ORDER BY searches DESC LIMIT 5',
        []
      );

      // 5. Daily Usage Graph (last 7 days)
      // To keep it 100% compliant with both SQL engines, fetch history dates and parse in JS
      const [dateRows] = await db.query(
        'SELECT created_at FROM research_history WHERE user_id = ? ORDER BY created_at ASC',
        [userId]
      );

      const dailyUsage = {};
      // Initialize last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyUsage[dateStr] = 0;
      }

      dateRows.forEach(row => {
        const dateStr = new Date(row.created_at).toISOString().split('T')[0];
        if (dailyUsage[dateStr] !== undefined) {
          dailyUsage[dateStr]++;
        }
      });

      const usageChartData = Object.keys(dailyUsage).map(key => ({
        date: key,
        searches: dailyUsage[key]
      }));

      return res.json({
        success: true,
        stats: {
          totalSearches,
          bookmarksCount: bookmarkRows[0]?.count || 0,
          savedReportsCount: savedRows[0]?.count || 0,
          tokensUsed,
          avgResponseTime
        },
        recentHistory: historyList,
        notifications,
        trendingCompanies: popularRows && popularRows.length > 0 ? popularRows : [
          { ticker: 'AAPL', company_name: 'Apple Inc.', searches: 12 },
          { ticker: 'TSLA', company_name: 'Tesla, Inc.', searches: 9 },
          { ticker: 'MSFT', company_name: 'Microsoft Corporation', searches: 7 }
        ],
        dailyUsage: usageChartData
      });
    } catch (error) {
      next(error);
    }
  },

  getAnalytics: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Compile detailed analytical metrics for charts
      const [reports] = await db.query(
        'SELECT ticker, company_name, investment_score, recommendation, created_at FROM investment_reports WHERE user_id = ?',
        [userId]
      );

      // Recommendation Distribution
      let buys = 0, holds = 0, passes = 0;
      const scoreRanges = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, 'Below 60': 0 };

      reports.forEach(r => {
        if (r.recommendation === 'BUY') buys++;
        else if (r.recommendation === 'HOLD') holds++;
        else if (r.recommendation === 'PASS') passes++;

        const s = r.investment_score;
        if (s >= 90) scoreRanges['90-100']++;
        else if (s >= 80) scoreRanges['80-89']++;
        else if (s >= 70) scoreRanges['70-79']++;
        else if (s >= 69) scoreRanges['60-69']++;
        else scoreRanges['Below 60']++;
      });

      const recommendationData = [
        { name: 'Buy', value: buys },
        { name: 'Hold', value: holds },
        { name: 'Pass', value: passes }
      ];

      const scoreDistributionData = Object.keys(scoreRanges).map(key => ({
        range: key,
        count: scoreRanges[key]
      }));

      // History of API log speeds
      const [logs] = await db.query('SELECT endpoint, method, status_code, response_time_ms, created_at FROM api_logs LIMIT 100', []);

      return res.json({
        success: true,
        recommendationDistribution: recommendationData,
        scoreDistribution: scoreDistributionData,
        recentLogs: logs
      });
    } catch (error) {
      next(error);
    }
  }
};
