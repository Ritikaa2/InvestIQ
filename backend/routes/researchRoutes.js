const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const { researchValidator } = require('../validators/researchValidator');
const validate = require('../middlewares/validationMiddleware');
const auth = require('../middlewares/authMiddleware');
const pdfGenerator = require('../utils/pdfGenerator');
const db = require('../config/db');

// Protected research endpoints
router.post('/research', auth, researchValidator, validate, researchController.researchCompany);
router.get('/history', auth, researchController.getHistory);
router.get('/suggestions', auth, researchController.getSuggestions);

// Reports
router.get('/report/:id', auth, researchController.getReport);
router.delete('/report/:id', auth, researchController.deleteReport);

// Saved reports (bookmarks of reports)
router.post('/save-report', auth, researchController.saveReport);
router.get('/saved', auth, researchController.getSavedReports);
router.delete('/saved/:id', auth, researchController.unsaveReport);

// PDF Download route
router.get('/report/:id/pdf', auth, async (req, res, next) => {
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
    const parsedReport = {
      ...report,
      profile: JSON.parse(report.report_data).profile,
      financials: JSON.parse(report.report_data).financials,
      news: JSON.parse(report.report_data).news,
      competitors: JSON.parse(report.report_data).competitors,
      swot: JSON.parse(report.report_data).swot,
      risks: JSON.parse(report.report_data).risks,
      decision: JSON.parse(report.report_data).decision
    };

    pdfGenerator.generateReportPDF(res, parsedReport);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
