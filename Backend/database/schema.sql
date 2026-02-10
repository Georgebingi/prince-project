-- =============================================
-- Kaduna High Court Management System
-- Database Schema - MySQL
-- =============================================

-- Create Database (if not exists)
CREATE DATABASE IF NOT EXISTS kaduna_court_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kaduna_court_db;

-- =============================================
-- Table: users
-- Stores all system users (judges, lawyers, staff, etc.)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    staff_id VARCHAR(50) UNIQUE,
    role ENUM('judge', 'registrar', 'clerk', 'admin', 'it_admin', 'court_admin', 'lawyer', 'auditor', 'partner') NOT NULL,
    department VARCHAR(255),
    status ENUM('active', 'pending', 'suspended', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_staff_id (staff_id),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: cases
-- Stores all court cases
-- =============================================
CREATE TABLE IF NOT EXISTS cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    type ENUM('Criminal', 'Civil', 'Family', 'Commercial', 'Appeal') NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending Approval',
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    description TEXT,
    filed_date DATE NOT NULL,
    next_hearing DATE,
    judge_id INT,
    lawyer_id INT,
    created_by INT NOT NULL,
    court VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (judge_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_case_number (case_number),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_judge_id (judge_id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_filed_date (filed_date),
    INDEX idx_next_hearing (next_hearing)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: case_parties
-- Stores parties involved in cases (plaintiffs, defendants)
-- =============================================
CREATE TABLE IF NOT EXISTS case_parties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    role ENUM('plaintiff', 'defendant', 'petitioner', 'respondent') NOT NULL,
    name VARCHAR(255) NOT NULL,
    lawyer_id INT,
    contact_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_case_id (case_id),
    INDEX idx_lawyer_id (lawyer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: documents
-- Stores document metadata
-- =============================================
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL,
    case_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT,
    description TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_case_id (case_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_status (status),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: case_timeline
-- Stores case history and events
-- =============================================
CREATE TABLE IF NOT EXISTS case_timeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_case_id (case_id),
    INDEX idx_date (date),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: hearings
-- Stores scheduled court hearings
-- =============================================
CREATE TABLE IF NOT EXISTS hearings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME,
    court_room VARCHAR(100),
    type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Scheduled',
    judge_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (judge_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_case_id (case_id),
    INDEX idx_judge_id (judge_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: sessions
-- Stores user sessions and refresh tokens
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_refresh_token (refresh_token(255)),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: audit_logs
-- Stores system audit trail
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: notifications
-- Stores user notifications
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    related_resource_type VARCHAR(100),
    related_resource_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_read (read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- IMPORTANT: After creating tables, run:
-- npm run create-admin
-- This will create an admin user with proper password hashing
-- =============================================
