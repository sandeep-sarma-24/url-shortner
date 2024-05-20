const axios = require('axios');
const pool = require('../db');

// Function to delete expired URLs from the database
const deleteExpiredUrls = async () => {
    try {
        // Get current time in UTC
        const currentTimeUTC = new Date();

        // Convert UTC to IST (Indian Standard Time)
        const ISTOptions = { timeZone: 'Asia/Kolkata' };
        const currentTimeIST = currentTimeUTC.toLocaleString('en-US', ISTOptions);

        const query = 'DELETE FROM urls WHERE expire_at <= $1';
        const values = [currentTimeIST];
        const result = await pool.query(query, values);
        console.log('Expired URLs cleaned up successfully:', result.rowCount);
    } catch (error) {
        console.error('Error cleaning up expired URLs:', error.message);
        throw error;
    }
};

// Function to insert or update URL requests count for a user IP
const updateUrlRequestCount = async (userIp) => {
    try {
        const query = 'INSERT INTO url_requests (user_ip, request_count) VALUES ($1, 1) ON CONFLICT (user_ip) DO UPDATE SET request_count = url_requests.request_count + 1 RETURNING *';
        const values = [userIp];
        const result = await pool.query(query, values);
        console.log('URL request count updated for IP:', userIp);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating URL request count:', error.message);
        throw error;
    }
};

// Export the deleteExpiredUrls and updateUrlRequestCount functions
exports.deleteExpiredUrls = deleteExpiredUrls;
exports.updateUrlRequestCount = updateUrlRequestCount;

// Function to shorten a URL
exports.shorten = async (longUrl, userIp, expireAt) => {
    try {
        console.log('Sending request to shorten URL:', longUrl);
        console.log('User IP:', userIp);
        console.log('Expiration time:', expireAt);

        const response = await axios.post('http://localhost:8080/api/shorten', {
            long_url: longUrl
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response received:', response.data);

        const shortUrl = response.data.short_url;

        const query = 'INSERT INTO urls (long_url, short_url, user_ip, expire_at) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [longUrl, shortUrl, userIp, expireAt];

        const result = await pool.query(query, values);

        // Update URL request count for user IP
        await updateUrlRequestCount(userIp);

        console.log('URL inserted into database:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Failed to shorten URL:', error.message);
        throw new Error('Failed to shorten URL');
    }
};
