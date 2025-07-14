const app = require('./app');
const cronService = require('./services/cronService');

const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log('🔒 GDPR compliance features active');
  
  // Initialize scheduled tasks
  cronService.initializeScheduledTasks();
}); 