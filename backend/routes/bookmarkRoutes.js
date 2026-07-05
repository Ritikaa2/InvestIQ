const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const auth = require('../middlewares/authMiddleware');

router.post('/bookmark', auth, bookmarkController.addBookmark);
router.get('/bookmarks', auth, bookmarkController.getBookmarks);
router.delete('/bookmark/:id', auth, bookmarkController.removeBookmark);

module.exports = router;
