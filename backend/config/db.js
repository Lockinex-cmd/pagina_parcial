const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config(); // Ensure .env variables are loaded

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('Conexión a la base de datos (pool) exitosa.');
    connection.release();
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos (pool):', err);
  });

module.exports = pool;