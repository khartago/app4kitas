const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const {
  getInstitutionSettings,
  updateInstitutionSettings,
  addClosedDay,
  removeClosedDay,
  getInstitutionStats
} = require('../controllers/institutionSettingsController');

// GET /institution-settings/:institutionId
router.get('/:institutionId', authMiddleware, getInstitutionSettings);

// PUT /institution-settings/:institutionId
router.put('/:institutionId', authMiddleware, updateInstitutionSettings);

// POST /institution-settings/:institutionId/closed-days
router.post('/:institutionId/closed-days', authMiddleware, addClosedDay);

// DELETE /institution-settings/:institutionId/closed-days/:closedDayId
router.delete('/:institutionId/closed-days/:closedDayId', authMiddleware, removeClosedDay);

// GET /institution-settings/:institutionId/stats
router.get('/:institutionId/stats', authMiddleware, getInstitutionStats);

module.exports = router; 