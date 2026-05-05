const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Supervisor → hostel email mapping
const SUPERVISOR_EMAIL_MAP = {
  'Hostel 1': 'supervisor.irfan@giki.edu.pk',
  'Hostel 2': 'supervisor.khalid@giki.edu.pk',
  'Hostel 3': 'supervisor.rizwan@giki.edu.pk',
  'Hostel 4': 'supervisor.hostel4@giki.edu.pk',
  'Hostel 5': 'supervisor.hostel5@giki.edu.pk',
};

const TECHNICIAN_EMAIL_MAP = {
  'Kashif Ali':  'kashif.ali@giki.edu.pk',
  'Bilal Ahmad': 'bilal.ahmad@giki.edu.pk',
  'Usman Khan':  'usman.khan@giki.edu.pk',
};

async function createNotification(type, message, userEmail, complaintId = null) {
  const id = `NOT#${Date.now()}${Math.floor(Math.random() * 1000)}`;
  await db.query(
    `INSERT INTO notifications (id, type, message, user_email, complaint_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, type, message, userEmail, complaintId]
  );
}

// Helper: map DB row → frontend Complaint shape
function mapComplaint(row) {
  return {
    id: row.id,
    category: row.category,
    urgency: row.urgency,
    status: row.status,
    date: row.created_at ? row.created_at.toISOString().split('T')[0] : null,
    description: row.description,
    roomNumber: row.room_number,
    hostel: row.hostel,
    studentName: row.student_name,
    studentEmail: row.student_email,
    photo: row.photo,
    technician: row.technician,
    workId: row.work_id,
    assignedOn: row.assigned_on ? row.assigned_on.toISOString().split('T')[0] : null,
    assignedBy: row.assigned_by,
    resolvedOn: row.resolved_on ? row.resolved_on.toISOString().split('T')[0] : null,
    rating: row.rating,
    feedback: row.feedback,
  };
}

// ─── GET /api/complaints ──────────────────────────────────────────────────────
// Returns complaints filtered by the caller's role
router.get('/', authenticate, async (req, res) => {
  try {
    let result;

    if (req.user.role === 'student') {
      result = await db.query(
        'SELECT * FROM complaints WHERE student_email = $1 ORDER BY created_at DESC',
        [req.user.email]
      );
    } else if (req.user.role === 'supervisor') {
      result = await db.query(
        'SELECT * FROM complaints WHERE hostel = $1 ORDER BY created_at DESC',
        [req.user.hostel]
      );
    } else if (req.user.role === 'technician') {
      // Technician sees tasks assigned to them (non-pending, non-rejected)
      result = await db.query(
        `SELECT * FROM complaints
         WHERE technician = $1
           AND status NOT IN ('Pending', 'Rejected')
         ORDER BY created_at DESC`,
        [req.user.name]
      );
    } else {
      result = await db.query('SELECT * FROM complaints ORDER BY created_at DESC');
    }

    return res.json(result.rows.map(mapComplaint));
  } catch (err) {
    console.error('GET /complaints error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/complaints/all ──────────────────────────────────────────────────
// Supervisor sees all complaints in their hostel; student sees own
router.get('/all', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'supervisor') {
      result = await db.query(
        'SELECT * FROM complaints WHERE hostel = $1 ORDER BY created_at DESC',
        [req.user.hostel]
      );
    } else if (req.user.role === 'student') {
      result = await db.query(
        'SELECT * FROM complaints WHERE student_email = $1 ORDER BY created_at DESC',
        [req.user.email]
      );
    } else {
      result = await db.query('SELECT * FROM complaints ORDER BY created_at DESC');
    }
    return res.json(result.rows.map(mapComplaint));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/complaints/:id ──────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM complaints WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    return res.json(mapComplaint(result.rows[0]));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/complaints ─────────────────────────────────────────────────────
router.post('/', authenticate, requireRole('student'), async (req, res) => {
  const { category, urgency, description, roomNumber, hostel, photo } = req.body;

  if (!category || !urgency || !description || !roomNumber || !hostel) {
    return res.status(400).json({ error: 'category, urgency, description, roomNumber, and hostel are required' });
  }

  // Generate complaint ID
  const countResult = await db.query('SELECT COUNT(*) FROM complaints');
  const count = parseInt(countResult.rows[0].count);
  const newId = `CN#${100 + count + Math.floor(Math.random() * 50)}`;

  try {
    await db.query(
      `INSERT INTO complaints
         (id, category, urgency, status, description, room_number, hostel,
          student_name, student_email, photo)
       VALUES ($1,$2,$3,'Pending',$4,$5,$6,$7,$8,$9)`,
      [
        newId, category, urgency, description, roomNumber, hostel,
        req.user.name, req.user.email, photo || null,
      ]
    );

    // Notify the supervisor of this hostel
    const supervisorEmail = SUPERVISOR_EMAIL_MAP[hostel];
    if (supervisorEmail) {
      await createNotification(
        'review',
        `New complaint ${newId} from ${req.user.name} in ${roomNumber}`,
        supervisorEmail,
        newId
      );
    }

    const created = await db.query('SELECT * FROM complaints WHERE id = $1', [newId]);
    return res.status(201).json(mapComplaint(created.rows[0]));
  } catch (err) {
    console.error('POST /complaints error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PATCH /api/complaints/:id ────────────────────────────────────────────────
router.patch('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Fetch existing complaint
    const existing = await db.query('SELECT * FROM complaints WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    const complaint = existing.rows[0];

    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let idx = 1;

    const allowed = [
      'status', 'technician', 'work_id', 'assigned_on', 'assigned_by',
      'resolved_on', 'rating', 'feedback', 'photo',
    ];

    // Map camelCase from frontend to snake_case DB columns
    const camelToSnake = {
      workId: 'work_id',
      assignedOn: 'assigned_on',
      assignedBy: 'assigned_by',
      resolvedOn: 'resolved_on',
    };

    for (const [key, val] of Object.entries(updates)) {
      const col = camelToSnake[key] || key;
      if (allowed.includes(col)) {
        fields.push(`${col} = $${idx++}`);
        values.push(val);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    await db.query(
      `UPDATE complaints SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    );

    // ── Notifications on status change ──────────────────────────────────────
    if (updates.status) {
      if (updates.status === 'Assigned' && updates.technician) {
        await createNotification(
          'assigned',
          `Your complaint ${id} has been assigned to ${updates.technician}`,
          complaint.student_email,
          id
        );

        const techEmail = TECHNICIAN_EMAIL_MAP[updates.technician];
        if (techEmail) {
          await createNotification(
            'assigned',
            `New task ${id} assigned to you - ${complaint.category} issue in ${complaint.room_number}`,
            techEmail,
            id
          );
        }
      }

      if (updates.status === 'In Progress') {
        await createNotification(
          'started',
          `Work has started on your complaint ${id}`,
          complaint.student_email,
          id
        );
      }

      if (updates.status === 'Resolved') {
        await createNotification(
          'resolved',
          `Your complaint ${id} has been resolved. Please rate the service.`,
          complaint.student_email,
          id
        );
      }
    }

    const updated = await db.query('SELECT * FROM complaints WHERE id = $1', [id]);
    return res.json(mapComplaint(updated.rows[0]));
  } catch (err) {
    console.error('PATCH /complaints/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── DELETE /api/complaints/:id ───────────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM complaints WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    return res.json({ message: 'Complaint deleted', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
