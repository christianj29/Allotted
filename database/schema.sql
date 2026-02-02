CREATE DATABASE IF NOT EXISTS allotted_mdm;
USE allotted_mdm;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) UNIQUE NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  model VARCHAR(120) NOT NULL,
  os_version VARCHAR(80),
  serial_number VARCHAR(120) UNIQUE NOT NULL,
  udid VARCHAR(120) UNIQUE,
  compliant BOOLEAN NOT NULL DEFAULT TRUE,
  primary_mac VARCHAR(50),
  secondary_mac VARCHAR(50),
  processor_type VARCHAR(80),
  user_id INT,
  CONSTRAINT fk_devices_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS computers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  model VARCHAR(120) NOT NULL,
  os_version VARCHAR(80),
  serial_number VARCHAR(120) UNIQUE NOT NULL,
  model_identifier VARCHAR(120),
  compliant BOOLEAN NOT NULL DEFAULT TRUE,
  processor_type VARCHAR(80),
  architecture_type VARCHAR(80),
  cache_size VARCHAR(50),
  user_id INT,
  CONSTRAINT fk_computers_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
