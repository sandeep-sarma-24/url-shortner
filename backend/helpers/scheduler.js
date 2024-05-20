const { cleanupExpiredUrls } = require('./cleanup');

const startCleanupScheduler = () => {
    cleanupExpiredUrls();
  
    setInterval(async () => {
      await cleanupExpiredUrls();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
};

module.exports = { startCleanupScheduler };
