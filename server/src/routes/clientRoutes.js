const express = require('express');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientProjects,
} = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, authorize('ADMIN'));

router.route('/').get(getClients).post(createClient);
router.route('/:id').get(getClient).patch(updateClient).delete(deleteClient);
router.get('/:id/projects', getClientProjects);

module.exports = router;
