const pool = require('../db');

const getLongUrl = async (shortUrl) => {
  try {
    const query = 'SELECT long_url FROM urls WHERE short_url = $1';
    const values = [shortUrl];
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      return result.rows[0].long_url;
    } else {
      throw new Error('URL not found');
    }
  } catch (error) {
    console.error('Error retrieving long URL:', error.message);
    throw error;
  }
};

module.exports = { getLongUrl };
