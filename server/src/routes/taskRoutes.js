const express = require('express');
const { updateTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, authorize('ADMIN'));

router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
