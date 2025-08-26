const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');

router.post('/', auth, upload.array('media', 10), messageController.sendMessage);
router.put('/:messageId/read', auth, messageController.markAsRead);

module.exports = router;