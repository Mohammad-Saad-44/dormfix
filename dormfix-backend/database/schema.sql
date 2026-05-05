-- DormFix PostgreSQL Schema
-- Run this file to initialize the database

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'supervisor', 'technician')),
    hostel VARCHAR(50),              -- for students and supervisors
    room_number VARCHAR(20),         -- for students only
    registration_number VARCHAR(50), -- for students only
    department VARCHAR(100),         -- for students only
    is_demo BOOLEAN DEFAULT FALSE,   -- marks seeded demo users
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- COMPLAINTS TABLE
-- ============================================================
CREATE TABLE complaints (
    id VARCHAR(20) PRIMARY KEY,       -- e.g. CN#147
    category VARCHAR(50) NOT NULL,
    urgency VARCHAR(10) NOT NULL CHECK (urgency IN ('High', 'Medium', 'Low')),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected')),
    description TEXT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    hostel VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    photo TEXT,                        -- base64 or URL
    technician VARCHAR(255),
    work_id VARCHAR(20),
    assigned_on DATE,
    assigned_by VARCHAR(255),
    resolved_on DATE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_complaints_student_email ON complaints(student_email);
CREATE INDEX idx_complaints_hostel ON complaints(hostel);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_technician ON complaints(technician);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE notifications (
    id VARCHAR(30) PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('assigned', 'started', 'resolved', 'review', 'new')),
    message TEXT NOT NULL,
    time_label VARCHAR(50) DEFAULT 'Just now',
    is_read BOOLEAN DEFAULT FALSE,
    user_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    complaint_id VARCHAR(20) REFERENCES complaints(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_email ON notifications(user_email);
CREATE INDEX idx_notifications_complaint_id ON notifications(complaint_id);

-- ============================================================
-- AUTO-UPDATE updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
