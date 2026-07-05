const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middlewares/authMiddleware');

router.put('/settings', auth, settingsController.updateSettings);
router.delete('/settings/delete-account', auth, settingsController.deleteAccount);

module.exports = router;
