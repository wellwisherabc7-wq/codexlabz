const express = require('express');
const { askChatbot } = require('../controllers/chatbotController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, authorize('CLIENT'));

router.post('/ask', askChatbot);

module.exports = router;
