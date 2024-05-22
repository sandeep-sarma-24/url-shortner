

const { Pool } = require('pg');

// Create a new Pool instance with the database connection details
const pool = new Pool({
  user: 'postgres',
  host: 'url-shortner.cnsiigkakxp3.us-west-2.rds.amazonaws.com',
  database: 'url_shortner',
  password: '12349876',
  port: 5432,
});

// Function to test the database connection
const testDatabaseConnection = async () => {
  try {
    console.log('Connecting to the database...');
    // Attempt to connect to the database
    const client = await pool.connect();
    console.log('Connected to the database');

	// Query the database to test if the connection is working
    const result = await client.query('SELECT * FROM urls');
    console.log('Result from database:', result.rows);

    // Release the client back to the pool
    client.release();
    
    // Close the connection pool
    await pool.end();

    console.log('Connection closed');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

// Call the function to test the database connection
testDatabaseConnection();

