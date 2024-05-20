const { deleteExpiredUrls } = require('../models/urlModel');

const cleanupExpiredUrls = async () => {
    try {
      await deleteExpiredUrls();
      console.log('Expired URLs cleaned up successfully.');
    } catch (error) {
      console.error('Error cleaning up expired URLs:', error.message);
    }
};

module.exports = { cleanupExpiredUrls };
