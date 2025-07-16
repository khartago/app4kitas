const cron = require('node-cron');
const gdprService = require('./gdprService');

/**
 * Cron Service - Handles scheduled tasks for GDPR compliance
 */

// Schedule GDPR cleanup to run daily at midnight
const scheduleGDPRCleanup = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Starting scheduled GDPR cleanup...');
    try {
      const result = await gdprService.purgeSoftDeletedEntities(12); // Default 12 months retention
      console.log(`✅ GDPR cleanup completed. Deleted ${result.totalPurged} expired records.`);
      console.log(`📊 Purged breakdown:`, result.purged);
    } catch (error) {
      console.error('❌ Error during scheduled GDPR cleanup:', error);
    }
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE || 'Europe/Berlin'
  });
  
  console.log('📅 GDPR cleanup scheduled to run daily at midnight (Berlin time)');
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