const urlModel = require('../models/urlModel');
const { startCleanupScheduler } = require('../helpers/scheduler'); 

exports.shortenUrl = async (req, res) => {
  const { long_url, expire_at } = req.body;
  const userIp = req.ip;

  console.log('Received request to shorten URL:', long_url);
  console.log('Expiration time:', expire_at);

  if (!long_url) {
    console.log('Error: long_url is required');
    return res.status(400).json({ error: 'long_url is required' });
  }

  try {
    const result = await urlModel.shorten(long_url, userIp, expire_at);
    console.log('URL shortened successfully:', result.short_url);
    res.json({ short_url: result.short_url });

    if (expire_at) {
      console.log('Scheduling cleanup task for:', expire_at);
      startCleanupScheduler(expire_at);
    }
  } catch (error) {
    console.error('Error shortening URL:', error.message);
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
};
