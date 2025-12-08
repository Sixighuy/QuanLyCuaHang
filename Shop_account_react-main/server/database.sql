-- Create database
CREATE DATABASE IF NOT EXISTS game_accounts_db;
USE game_accounts_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  balance DECIMAL(20, 2) DEFAULT 0.00 COMMENT 'User wallet balance',
  customer_code VARCHAR(20) UNIQUE COMMENT 'Unique customer code for top-up',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table (Game accounts)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_name VARCHAR(100) NOT NULL,
  account_level VARCHAR(50),
  import_price DECIMAL(20, 2) DEFAULT 0.00 COMMENT 'Giá nhập (giá vốn) của sản phẩm',
  price DECIMAL(20, 2) NOT NULL,
  description TEXT,
  account_info TEXT,
  featured_image VARCHAR(500) DEFAULT NULL COMMENT 'URL of featured/thumbnail image for product card',
  images TEXT DEFAULT NULL COMMENT 'JSON array of image URLs',
  status ENUM('available', 'sold', 'pending') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  total_price DECIMAL(20, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Top-up requests table
CREATE TABLE IF NOT EXISTS topup_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  customer_code VARCHAR(20) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  approved_by INT NULL,
  notes TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Note: To insert sample data, run sample_data.sql after this file

