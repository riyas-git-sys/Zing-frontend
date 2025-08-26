const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const auth = require('../middlewares/auth');

router.post('/', auth, chatController.createChat);
router.post('/group', auth, chatController.createGroupChat);
router.get('/', auth, chatController.getUserChats);
router.get('/:chatId/messages', auth, chatController.getChatMessages);
router.get('/search', auth, chatController.searchUsers);
router.put('/:chatId/add', auth, chatController.addToGroup);

module.exports = router;