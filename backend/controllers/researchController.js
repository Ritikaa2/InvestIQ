const aiResearchService = require('../services/aiResearchService');
const cacheService = require('../services/cacheService');
const db = require('../config/db');

// List of top popular companies for autocomplete and search suggestions
const POPULAR_COMPANIES = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. (Google)' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'META', name: 'Meta Platforms, Inc.' },
  { ticker: 'NFLX', name: 'Netflix, Inc.' },
  { ticker: 'AMD', name: 'Advanced Micro Devices, Inc.' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
  { ticker: 'DIS', name: 'The Walt Disney Company' },
  { ticker: 'BRK.A', name: 'Berkshire Hathaway Inc.' }
];

module.exports = {
  // SSE-based Agent research workflow streamer
  researchCompany: async (req, res, next) => {
    const { ticker } = req.body;
    const userId = req.user.id;
    
    if (!ticker) {
      return res.status(400).json({ success: false, message: 'Stock ticker is required.' });
    }

    const tickerUpper = ticker.toUpperCase().trim();

    // Set headers for Server-Sent Events (SSE)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Content-Encoding': 'none'
    });
    res.flushHeaders();

    // Helper to send events in SSE format
    const sendSSEEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      sendSSEEvent('info', { message: `Checking cache for ${tickerUpper}...` });
      
      // Check company cache database
      const cachedReport = await cacheService.getDbCache(tickerUpper);
      if (cachedReport) {
        sendSSEEvent('info', { message: `Cache hit! Compiling stored research dossier for ${tickerUpper}...` });
        
        // Simulating rapid progress bars for cached reports
        for (let step = 1; step <= 7; step++) {
          const stepNames = [
            'Profile Research',
            'Financial Analysis',
            'News Intelligence',
            'Competitor Analysis',
            'SWOT Assessment',
            'Risk Evaluation',
            'Investment Decision'
          ];
          sendSSEEvent('progress', {
            step,
            name: stepNames[step - 1],
            status: 'completed',
            log: `Loaded ${stepNames[step - 1]} from persistent cache.`
          });
          await new Promise(r => setTimeout(r, 150));
        }

        // Insert into research history
        const [historyResult] = await db.query(
          'INSERT INTO research_history (user_id, company_name, ticker, status, response_time_ms, tokens_used) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, cachedReport.profile.companyName, tickerUpper, 'completed', 100, 0]
        );
        const historyId = historyResult.insertId;

        // Insert into investment reports
        const [reportResult] = await db.query(
          'INSERT INTO investment_reports (history_id, user_id, company_name, ticker, report_data, investment_score, recommendation, ai_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            historyId,
            userId,
            cachedReport.profile.companyName,
            tickerUpper,
            JSON.stringify(cachedReport),
            cachedReport.decision.investmentScore,
            cachedReport.decision.recommendation,
            cachedReport.decision.aiSummary
          ]
        );
        
        // Send welcoming notification
        await db.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [userId, 'Research Completed', `AI report compiled successfully for ${cachedReport.profile.companyName} (${tickerUpper}).`]
        );

        sendSSEEvent('complete', {
          reportId: reportResult.insertId,
          data: cachedReport
        });
        return res.end();
      }

      // No cache - run the full LangGraph pipeline
      const startTime = Date.now();
      
      // Initialize pending history row
      const [initHistory] = await db.query(
        'INSERT INTO research_history (user_id, company_name, ticker, status) VALUES (?, ?, ?, ?)',
        [userId, tickerUpper, tickerUpper, 'pending']
      );
      const historyId = initHistory.insertId;

      const finalReport = await aiResearchService.runResearch(
        tickerUpper,
        null,
        (progress) => {
          sendSSEEvent('progress', progress);
        }
      );

      const duration = Date.now() - startTime;
      const tokensUsed = Math.floor(duration / 10) + 1200; // estimated tokens

      // Update history row
      await db.query(
        'UPDATE research_history SET status = ?, response_time_ms = ?, tokens_used = ? WHERE id = ?',
        ['completed', duration, tokensUsed, historyId]
      );

      // Save report in DB
      const [reportInsert] = await db.query(
        'INSERT INTO investment_reports (history_id, user_id, company_name, ticker, report_data, investment_score, recommendation, ai_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          historyId,
          userId,
          finalReport.profile.companyName,
          tickerUpper,
          JSON.stringify(finalReport),
          finalReport.decision.investmentScore,
          finalReport.decision.recommendation,
          finalReport.decision.aiSummary
        ]
      );
      const reportId = reportInsert.insertId;

      // Add report to cache
      await cacheService.setDbCache(tickerUpper, finalReport.profile.companyName, finalReport, 24);

      // Create notification
      await db.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [userId, 'Research Completed', `AI report compiled successfully for ${finalReport.profile.companyName} (${tickerUpper}).`]
      );

      sendSSEEvent('complete', {
        reportId,
        data: finalReport
      });
      res.end();
    } catch (error) {
      console.error('Research pipeline failed:', error);
      sendSSEEvent('error', { message: error.message || 'The LangGraph pipeline encountered a runtime error.' });
      res.end();
    }
  },

  getHistory: async (req, res, next) => {
    try {
      const [history] = await db.query(
        'SELECT rh.*, ir.id as report_id, ir.investment_score, ir.recommendation ' +
        'FROM research_history rh ' +
        'LEFT JOIN investment_reports ir ON rh.id = ir.history_id ' +
        'WHERE rh.user_id = ? ORDER BY rh.created_at DESC',
        [req.user.id]
      );
      
      return res.json({ success: true, history });
    } catch (error) {
      next(error);
    }
  },

  getReport: async (req, res, next) => {
    try {
      const { id } = req.params;
      const [reports] = await db.query(
        'SELECT * FROM investment_reports WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      if (!reports || reports.length === 0) {
        return res.status(404).json({ success: false, message: 'Investment report not found.' });
      }

      const report = reports[0];
      return res.json({
        success: true,
        report: {
          id: report.id,
          history_id: report.history_id,
          user_id: report.user_id,
          company_name: report.company_name,
          ticker: report.ticker,
          report_data: JSON.parse(report.report_data),
          investment_score: report.investment_score,
          recommendation: report.recommendation,
          ai_summary: report.ai_summary,
          created_at: report.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  },

  deleteReport: async (req, res, next) => {
    try {
      const { id } = req.params;
      const [result] = await db.query(
        'DELETE FROM investment_reports WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Report not found or unauthorized.' });
      }

      return res.json({ success: true, message: 'Investment report deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },

  saveReport: async (req, res, next) => {
    try {
      const { report_id } = req.body;
      if (!report_id) {
        return res.status(400).json({ success: false, message: 'report_id is required.' });
      }

      // Check if report exists
      const [reports] = await db.query('SELECT id FROM investment_reports WHERE id = ?', [report_id]);
      if (!reports || reports.length === 0) {
        return res.status(404).json({ success: false, message: 'Report not found.' });
      }

      await db.query(
        'INSERT INTO saved_reports (user_id, report_id) VALUES (?, ?)',
        [req.user.id, report_id]
      );

      return res.json({ success: true, message: 'Report saved to dashboard library.' });
    } catch (error) {
      next(error);
    }
  },

  getSavedReports: async (req, res, next) => {
    try {
      const [reports] = await db.query(
        'SELECT sr.id as saved_id, sr.created_at as saved_at, ir.* ' +
        'FROM saved_reports sr ' +
        'JOIN investment_reports ir ON sr.report_id = ir.id ' +
        'WHERE sr.user_id = ? ORDER BY sr.created_at DESC',
        [req.user.id]
      );

      const parsedReports = reports.map(r => ({
        id: r.id,
        saved_id: r.saved_id,
        saved_at: r.saved_at,
        company_name: r.company_name,
        ticker: r.ticker,
        investment_score: r.investment_score,
        recommendation: r.recommendation,
        ai_summary: r.ai_summary,
        created_at: r.created_at
      }));

      return res.json({ success: true, saved_reports: parsedReports });
    } catch (error) {
      next(error);
    }
  },

  unsaveReport: async (req, res, next) => {
    try {
      const { id } = req.params; // report_id
      await db.query(
        'DELETE FROM saved_reports WHERE user_id = ? AND report_id = ?',
        [req.user.id, id]
      );

      return res.json({ success: true, message: 'Report removed from saved library.' });
    } catch (error) {
      next(error);
    }
  },

  // Autocomplete Suggestions API
  getSuggestions: async (req, res, next) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.json({ success: true, suggestions: POPULAR_COMPANIES });
      }

      const q = query.toLowerCase().trim();
      const filtered = POPULAR_COMPANIES.filter(
        c => c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      );

      return res.json({ success: true, suggestions: filtered });
    } catch (error) {
      next(error);
    }
  }
};
