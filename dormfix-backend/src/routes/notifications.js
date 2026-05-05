const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function mapNotification(row) {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    time: row.time_label || 'Just now',
    date: row.created_at ? row.created_at.toISOString() : null,
    read: row.is_read,
    userEmail: row.user_email,
    complaintId: row.complaint_id,
  };
}

// ─── GET /api/notifications ───────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_email = $1 ORDER BY created_at DESC',
      [req.user.email]
    );
    return res.json(result.rows.map(mapNotification));
  } catch (err) {
    console.error('GET /notifications error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_email = $2',
      [req.params.id, req.user.email]
    );
    return res.json({ message: 'Marked as read' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_email = $1',
      [req.user.email]
    );
    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
