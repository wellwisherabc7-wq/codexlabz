const { buildClientContext, askGemini } = require('../services/chatbotService');

const askChatbot = async (req, res) => {
  if (req.user?.role !== 'CLIENT') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { message } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const trimmed = message.trim();
  if (trimmed.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Message is too long. Please keep it under 500 characters.',
    });
  }

  try {
    const context = await buildClientContext(req.user.clientId);
    const reply = await askGemini(trimmed, context);
    return res.json({
      success: true,
      data: { reply },
    });
  } catch (err) {
    console.error('Chatbot error:', err);
    return res.json({
      success: true,
      data: {
        reply:
          "I'm sorry, I am currently having trouble processing your request. Please try asking again in a moment.",
      },
    });
  }
};

module.exports = {
  askChatbot,
};
