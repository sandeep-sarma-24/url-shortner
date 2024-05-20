const { getLongUrl } = require('../models/redirectModel');

const redirect = async (req, res) => {
    const shortUrl = `http://tiny.url/${req.params.shortUrlId}`;
    try {
    const longUrl = await getLongUrl(shortUrl);
    res.redirect(longUrl);
  } catch (error) {
    console.error('Error redirecting to long URL:', error.message);
    res.status(404).json({ error: 'URL not found' });
  }
};

module.exports = { redirect };
