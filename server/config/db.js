const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'game_accounts_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Tạo pool dùng promise để tiện dùng async/await
const pool = mysql.createPool(config).promise();

// Kiểm tra kết nối ngay khi khởi động server để log rõ ràng
pool
  .getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err);
  });

module.exports = pool;

