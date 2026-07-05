const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/authMiddleware');

router.get('/dashboard', auth, dashboardController.getDashboardStats);
router.get('/analytics', auth, dashboardController.getAnalytics);

module.exports = router;
