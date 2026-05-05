const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/users/technicians ───────────────────────────────────────────────
// Returns list of technician names (used by supervisor when assigning)
router.get('/technicians', authenticate, requireRole('supervisor'), async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, email, name FROM users WHERE role = 'technician' ORDER BY name"
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/users/profile ───────────────────────────────────────────────────
router.get('/profile', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, role, hostel, room_number, registration_number, department, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const u = result.rows[0];
    return res.json({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      hostel: u.hostel,
      roomNumber: u.room_number,
      registrationNumber: u.registration_number,
      department: u.department,
      createdAt: u.created_at,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PATCH /api/users/profile ─────────────────────────────────────────────────
router.patch('/profile', authenticate, async (req, res) => {
  const { name, hostel, roomNumber, department } = req.body;

  const fields = [];
  const values = [];
  let idx = 1;

  if (name) { fields.push(`name = $${idx++}`); values.push(name); }
  if (hostel !== undefined) { fields.push(`hostel = $${idx++}`); values.push(hostel); }
  if (roomNumber !== undefined) { fields.push(`room_number = $${idx++}`); values.push(roomNumber); }
  if (department !== undefined) { fields.push(`department = $${idx++}`); values.push(department); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.user.id);

  try {
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    return res.json({ message: 'Profile updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/users/change-password ─────────────────────────────────────────
router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }

  try {
    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
