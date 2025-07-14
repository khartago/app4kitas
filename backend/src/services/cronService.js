const cron = require('node-cron');
const gdprService = require('./gdprService');

/**
 * Cron Service - Handles scheduled tasks for GDPR compliance
 */

// Schedule GDPR cleanup to run daily at 2:00 AM
const scheduleGDPRCleanup = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Starting scheduled GDPR cleanup...');
    try {
      const result = await gdprService.cleanupExpiredRecords();
      console.log(`✅ GDPR cleanup completed. Deleted ${result.deletedCount} expired records.`);
    } catch (error) {
      console.error('❌ Error during scheduled GDPR cleanup:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Europe/Berlin'
  });
  
  console.log('📅 GDPR cleanup scheduled to run daily at 2:00 AM (Berlin time)');
};

// Initialize all scheduled tasks
const initializeScheduledTasks = () => {
  scheduleGDPRCleanup();
  console.log('🚀 All scheduled tasks initialized');
};

module.exports = {
  initializeScheduledTasks,
  scheduleGDPRCleanup
}; 