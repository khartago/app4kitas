const express = require('express');
const router = express.Router();
const { requireSuperAdmin, auth } = require('../middlewares/auth');
const {
  createGDPRRequest,
  getGDPRRequests,
  approveGDPRRequest,
  rejectGDPRRequest,
  getGDPRRequest
} = require('../controllers/gdprRequestController');

// POST /api/gdpr/request-delete/:userId - Create a GDPR deletion request
router.post('/request-delete/:userId', requireSuperAdmin, createGDPRRequest);

// GET /api/gdpr/requests - List all GDPR deletion requests
router.get('/requests', requireSuperAdmin, getGDPRRequests);

// GET /api/gdpr/requests/:requestId - Get a specific GDPR request
router.get('/requests/:requestId', requireSuperAdmin, getGDPRRequest);

// POST /api/gdpr/requests/:requestId/approve - Approve a GDPR deletion request
router.post('/requests/:requestId/approve', requireSuperAdmin, approveGDPRRequest);

// POST /api/gdpr/requests/:requestId/reject - Reject a GDPR deletion request
router.post('/requests/:requestId/reject', requireSuperAdmin, rejectGDPRRequest);

/**
 * Generate automated compliance report
 */
router.get('/compliance-report', auth, async (req, res) => {
  try {
    const { institutionId, dateRange = 'month' } = req.query;
    const gdprService = require('../services/gdprService');
    
    const report = await gdprService.generateComplianceReport(
      institutionId || null, 
      dateRange
    );
    
    res.json({
      success: true,
      report: report.report
    });
  } catch (error) {
    console.error('Error generating compliance report:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Generieren des Compliance-Reports'
    });
  }
});

/**
 * Verify backup integrity
 */
router.post('/verify-backup', auth, async (req, res) => {
  try {
    const gdprService = require('../services/gdprService');
    
    const verification = await gdprService.verifyBackupIntegrity();
    
    res.json({
      success: true,
      ...verification
    });
  } catch (error) {
    console.error('Error verifying backup integrity:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler bei der Backup-Verifizierung'
    });
  }
});

/**
 * Implement privacy-by-design measures
 */
router.post('/privacy-by-design', auth, async (req, res) => {
  try {
    const gdprService = require('../services/gdprService');
    
    const result = await gdprService.implementPrivacyByDesign();
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error implementing privacy-by-design:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler bei der Privacy-by-Design Implementierung'
    });
  }
});

/**
 * Monitor compliance in real-time
 */
router.get('/monitor-compliance', auth, async (req, res) => {
  try {
    const gdprService = require('../services/gdprService');
    
    const monitoring = await gdprService.monitorComplianceRealTime();
    
    res.json({
      success: true,
      ...monitoring
    });
  } catch (error) {
    console.error('Error monitoring compliance:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Compliance-Monitoring'
    });
  }
});

/**
 * Get anomaly detection results
 */
router.get('/anomaly-detection', auth, async (req, res) => {
  try {
    const { institutionId, dateRange = 'week' } = req.query;
    const gdprService = require('../services/gdprService');
    
    const anomalies = await gdprService.detectAnomalies(
      null, 
      institutionId ? { institutionId } : {}, 
      { 
        createdAt: { 
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        } 
      }
    );
    
    res.json({
      success: true,
      anomalies
    });
  } catch (error) {
    console.error('Error getting anomaly detection:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler bei der Anomalie-Erkennung'
    });
  }
});

/**
 * Get compliance recommendations
 */
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { institutionId } = req.query;
    const gdprService = require('../services/gdprService');
    
    // Generate a temporary report to get recommendations
    const report = await gdprService.generateComplianceReport(
      institutionId || null, 
      'month'
    );
    
    res.json({
      success: true,
      recommendations: report.report.recommendations
    });
  } catch (error) {
    console.error('Error getting compliance recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Abrufen der Compliance-Empfehlungen'
    });
  }
});

/**
 * Get compliance score
 */
router.get('/compliance-score', auth, async (req, res) => {
  try {
    const { institutionId } = req.query;
    const gdprService = require('../services/gdprService');
    
    // Generate a temporary report to get compliance score
    const report = await gdprService.generateComplianceReport(
      institutionId || null, 
      'month'
    );
    
    res.json({
      success: true,
      score: report.report.complianceScore
    });
  } catch (error) {
    console.error('Error getting compliance score:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Abrufen des Compliance-Scores'
    });
  }
});

module.exports = router; 