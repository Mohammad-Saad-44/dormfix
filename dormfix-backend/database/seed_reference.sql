-- DormFix Seed Data
-- Demo users (passwords are bcrypt hashes)
-- student123  -> $2b$10$K9L1Gx3s8mNq2pR4vTzYuOWkJ7dF5hXeA0cBi6nM3yE1rPvQsLtDa
-- super123    -> $2b$10$H2F5Nx8v1kMp3qS6wUyZrOVjI4bE7gYaB9dCl2oN0xF5uRtPsKmGh
-- tech123     -> $2b$10$L3G6Oy9w2lNq4rT7xVzAsPWkJ5cF8iZbC1eDm3pO1yG6vSuQtLnHi
-- NOTE: The seed.js script generates proper bcrypt hashes at runtime.
-- This file is for reference only; use seed.js to seed the database.

-- Demo Users
INSERT INTO users (email, password_hash, name, role, hostel, room_number, is_demo)
VALUES
  ('ahmed.raza@giki.edu.pk',        '__HASH_student123__', 'Ahmed Raza',        'student',    'Hostel 1', '203-A', TRUE),
  ('supervisor.irfan@giki.edu.pk',  '__HASH_super123__',   'Supervisor Irfan',  'supervisor', 'Hostel 1', NULL,    TRUE),
  ('supervisor.khalid@giki.edu.pk', '__HASH_super123__',   'Supervisor Khalid', 'supervisor', 'Hostel 2', NULL,    TRUE),
  ('supervisor.rizwan@giki.edu.pk', '__HASH_super123__',   'Supervisor Rizwan', 'supervisor', 'Hostel 3', NULL,    TRUE),
  ('kashif.ali@giki.edu.pk',        '__HASH_tech123__',    'Kashif Ali',        'technician', NULL,       NULL,    TRUE),
  ('bilal.ahmad@giki.edu.pk',       '__HASH_tech123__',    'Bilal Ahmad',       'technician', NULL,       NULL,    TRUE),
  ('usman.khan@giki.edu.pk',        '__HASH_tech123__',    'Usman Khan',        'technician', NULL,       NULL,    TRUE);
