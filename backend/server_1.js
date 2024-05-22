const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const axios = require('axios');

// Database connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'url-shortner.cnsiigkakxp3.us-west-2.rds.amazonaws.com',
  database: 'url_shortner',
  password: '12349876',
  port: 5432,
});

const app = express();
app.use(bodyParser.json());

// Function to delete expired URLs from the database
const deleteExpiredUrls = async () => {
  try {
    console.log('Starting cleanup of expired URLs...');
    const currentTimeUTC = new Date();
    const ISTOptions = { timeZone: 'Asia/Kolkata', hour12: false, timeZoneName: 'short' };
    const currentTimeIST = new Date(currentTimeUTC.toLocaleString('en-US', ISTOptions));

    console.log('Current time in IST:', currentTimeIST);

    const query = 'DELETE FROM public.urls WHERE expire_at <= $1'; // Specifying schema
    const values = [currentTimeIST.toISOString()]; // Ensure ISO format for PostgreSQL timestamp

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
    const query = 'INSERT INTO public.url_requests (user_ip, request_count) VALUES ($1, 1) ON CONFLICT (user_ip) DO UPDATE SET request_count = url_requests.request_count + 1 RETURNING *'; // Specifying schema
    const values = [userIp];
    const result = await pool.query(query, values);
    console.log('URL request count updated for IP:', userIp);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating URL request count:', error.message);
    throw error;
  }
};

// Function to shorten a URL
const shortenUrl = async (longUrl, userIp, expireAt) => {
  try {
    console.log('Sending request to shorten URL:', longUrl);
    console.log('User IP:', userIp);
    console.log('Expiration time:', expireAt);

    const response = await axios.post('http://52.13.22.149:8080/api/shorten', {
      long_url: longUrl
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response received:', response.data);

    const shortUrl = response.data.short_url;

    const query = 'INSERT INTO public.urls (long_url, short_url, user_ip, expire_at) VALUES ($1, $2, $3, $4) RETURNING *'; // Specifying schema
    const values = [longUrl, shortUrl, userIp, expireAt];

    const result = await pool.query(query, values);
    await updateUrlRequestCount(userIp);
    console.log('URL inserted into database:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Failed to shorten URL:', error.message);
    throw new Error('Failed to shorten URL');
  }
};

// Endpoint to shorten a URL
app.post('/shorten', async (req, res) => {
  const { longUrl, userIp, expireAt } = req.body;
  try {
    const result = await shortenUrl(longUrl, userIp, expireAt);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to clean up expired URLs
app.get('/cleanup', async (req, res) => {
  try {
    await deleteExpiredUrls();
    res.status(200).send('Expired URLs cleaned up');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Node.js server is running on http://localhost:3000');
});
