const express = require('express');
const { getAdminDashboard, getClientDashboard } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/admin', authorize('ADMIN'), getAdminDashboard);
router.get('/client/:clientId', getClientDashboard);

module.exports = router;
