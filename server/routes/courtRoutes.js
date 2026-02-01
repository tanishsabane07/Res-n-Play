const express = require('express');
const {
  createCourt,
  getAllCourts,
  getCourtById,
  getOwnerCourts,
  updateCourt,
  deleteCourt,
  toggleCourtStatus
} = require('../controllers/courtController');

const { auth, requireOwner } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', getAllCourts);
router.get('/:id', getCourtById);

// Protected routes (require authentication)
router.use(auth);

// Owner-only routes
router.post('/', requireOwner, createCourt);
router.get('/owner/my-courts', requireOwner, getOwnerCourts);
router.put('/:id', requireOwner, updateCourt);
router.delete('/:id', requireOwner, deleteCourt);
router.patch('/:id/toggle-status', requireOwner, toggleCourtStatus);

module.exports = router;
