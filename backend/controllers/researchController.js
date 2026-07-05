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
function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveResearchInput(body) {
  const rawInput = normalizeText(body?.ticker || body?.companyName || body?.company_name || body?.query);
  const normalizedInput = rawInput.toLowerCase();
  const known = POPULAR_COMPANIES.find(company =>
    company.ticker.toLowerCase() === normalizedInput ||
    company.name.toLowerCase() === normalizedInput ||
    company.name.toLowerCase().includes(normalizedInput) ||
    normalizedInput.includes(company.name.toLowerCase())
  );

  if (known) {
    return { ticker: known.ticker.toUpperCase(), companyName: known.name, rawInput };
  }

  const compactTicker = rawInput.toUpperCase().replace(/[^A-Z0-9.]/g, '').slice(0, 10);
  const looksLikeTicker = /^[A-Z0-9.]{1,10}$/.test(rawInput.toUpperCase());
  const ticker = looksLikeTicker ? rawInput.toUpperCase() : compactTicker;
  const companyName = looksLikeTicker ? '' : rawInput;

  return {
    ticker: ticker || rawInput.toUpperCase().slice(0, 10) || 'UNKNOWN',
    companyName,
    rawInput
  };
}

function fallbackCompanyName(ticker) {
  const normalizedTicker = normalizeText(ticker).toUpperCase();
  const known = POPULAR_COMPANIES.find(company => company.ticker === normalizedTicker);
  return known?.name || (normalizedTicker ? `${normalizedTicker} Corporation` : 'Unknown Company');
}

function getReportCompanyName(report, ticker) {
  return normalizeText(report?.profile?.companyName) ||
    normalizeText(report?.profile?.name) ||
    normalizeText(report?.companyName) ||
    normalizeText(report?.company_name) ||
    fallbackCompanyName(ticker);
}

function normalizeReportForStorage(report, ticker) {
  const normalizedTicker = normalizeText(ticker || report?.profile?.ticker).toUpperCase();
  const companyName = getReportCompanyName(report, normalizedTicker);

  return {
    ...report,
    profile: {
      ...(report?.profile || {}),
      ticker: normalizedTicker,
      companyName
    }
  };
}
module.exports = {
  // SSE-based Agent research workflow streamer
  researchCompany: async (req, res, next) => {
    const { ticker: tickerUpper, companyName: requestedCompanyName } = resolveResearchInput(req.body);
    const userId = req.user.id;
    
    if (!tickerUpper) {
      return res.status(400).json({ success: false, message: 'Company name or ticker is required.' });
    }

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
        const storedReport = normalizeReportForStorage(cachedReport, tickerUpper);
        const companyName = storedReport.profile.companyName;
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
          [userId, companyName, tickerUpper, 'completed', 100, 0]
        );
        const historyId = historyResult.insertId;

        // Insert into investment reports
        const [reportResult] = await db.query(
          'INSERT INTO investment_reports (history_id, user_id, company_name, ticker, report_data, investment_score, recommendation, ai_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            historyId,
            userId,
            companyName,
            tickerUpper,
            JSON.stringify(storedReport),
            storedReport.decision.investmentScore,
            storedReport.decision.recommendation,
            storedReport.decision.aiSummary
          ]
        );
        
        // Send welcoming notification
        await db.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [userId, 'Research Completed', `AI report compiled successfully for ${companyName} (${tickerUpper}).`]
        );

        sendSSEEvent('complete', {
          reportId: reportResult.insertId,
          data: storedReport
        });
        return res.end();
      }

      // No cache - run the full LangGraph pipeline
      const startTime = Date.now();
      
      // Initialize pending history row
      const [initHistory] = await db.query(
        'INSERT INTO research_history (user_id, company_name, ticker, status) VALUES (?, ?, ?, ?)',
        [userId, requestedCompanyName || fallbackCompanyName(tickerUpper), tickerUpper, 'pending']
      );
      const historyId = initHistory.insertId;

      // Retrieve user's settings to check selected model
      const [settingsList] = await db.query('SELECT * FROM settings WHERE user_id = ?', [userId]);
      const userSettings = settingsList && settingsList.length > 0 ? settingsList[0] : null;
      const selectedModel = userSettings?.ai_model || 'gemini';

      let finalReport = await aiResearchService.runResearch(
        tickerUpper,
        requestedCompanyName || null,
        selectedModel,
        (progress) => {
          sendSSEEvent('progress', progress);
        }
      );
      finalReport = normalizeReportForStorage(finalReport, tickerUpper);
      const companyName = finalReport.profile.companyName;

      const duration = Date.now() - startTime;
      const tokensUsed = Math.floor(duration / 10) + 1200; // estimated tokens

      // Update history row
      await db.query(
        'UPDATE research_history SET company_name = ?, status = ?, response_time_ms = ?, tokens_used = ? WHERE id = ?',
        [companyName, 'completed', duration, tokensUsed, historyId]
      );

      // Save report in DB
      const [reportInsert] = await db.query(
        'INSERT INTO investment_reports (history_id, user_id, company_name, ticker, report_data, investment_score, recommendation, ai_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          historyId,
          userId,
          companyName,
          tickerUpper,
          JSON.stringify(finalReport),
          finalReport.decision.investmentScore,
          finalReport.decision.recommendation,
          finalReport.decision.aiSummary
        ]
      );
      const reportId = reportInsert.insertId;

      // Add report to cache
      await cacheService.setDbCache(tickerUpper, companyName, finalReport, 24);

      // Create notification
      await db.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [userId, 'Research Completed', `AI report compiled successfully for ${companyName} (${tickerUpper}).`]
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
      const [reports] = await db.query(
        'SELECT id, history_id FROM investment_reports WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      if (!reports || reports.length === 0) {
        return res.status(404).json({ success: false, message: 'Report not found or unauthorized.' });
      }

      const historyId = reports[0].history_id;
      await db.query('DELETE FROM saved_reports WHERE user_id = ? AND report_id = ?', [req.user.id, id]);
      await db.query('DELETE FROM investment_reports WHERE id = ? AND user_id = ?', [id, req.user.id]);
      if (historyId) {
        await db.query('DELETE FROM research_history WHERE id = ? AND user_id = ?', [historyId, req.user.id]);
      }

      return res.json({ success: true, message: 'Research report and history entry deleted successfully.' });
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

      const [reports] = await db.query(
        'SELECT id FROM investment_reports WHERE id = ? AND user_id = ?',
        [report_id, req.user.id]
      );
      if (!reports || reports.length === 0) {
        return res.status(404).json({ success: false, message: 'Report not found.' });
      }

      const [existing] = await db.query(
        'SELECT id FROM saved_reports WHERE user_id = ? AND report_id = ?',
        [req.user.id, report_id]
      );
      if (existing && existing.length > 0) {
        return res.json({ success: true, message: 'Report is already saved.', saved_id: existing[0].id });
      }

      const [result] = await db.query(
        'INSERT INTO saved_reports (user_id, report_id) VALUES (?, ?)',
        [req.user.id, report_id]
      );

      return res.json({ success: true, message: 'Report saved to dashboard library.', saved_id: result.insertId });
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
      const { id } = req.params;
      const [result] = await db.query(
        'DELETE FROM saved_reports WHERE user_id = ? AND (id = ? OR report_id = ?)',
        [req.user.id, id, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Saved report not found.' });
      }

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
