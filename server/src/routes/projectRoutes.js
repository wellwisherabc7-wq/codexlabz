const express = require('express');
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjectTasks,
  createProjectTask,
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.post('/', authorize('ADMIN'), createProject);
router.get('/:id', getProject);
router.patch('/:id', authorize('ADMIN'), updateProject);
router.delete('/:id', authorize('ADMIN'), deleteProject);
router.get('/:id/tasks', getProjectTasks);
router.post('/:id/tasks', authorize('ADMIN'), createProjectTask);

module.exports = router;
