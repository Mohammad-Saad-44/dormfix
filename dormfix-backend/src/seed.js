const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('Seeding database with demo data...');

  // Hash passwords
  const studentHash = await bcrypt.hash('student123', 10);
  const superHash   = await bcrypt.hash('super123', 10);
  const techHash    = await bcrypt.hash('tech123', 10);

  // ─── Users ──────────────────────────────────────────────────────────────────
  const users = [
    { email: 'ahmed.raza@giki.edu.pk',        hash: studentHash, name: 'Ahmed Raza',        role: 'student',    hostel: 'Hostel 1', room: '203-A' },
    { email: 'supervisor.irfan@giki.edu.pk',  hash: superHash,   name: 'Supervisor Irfan',  role: 'supervisor', hostel: 'Hostel 1', room: null },
    { email: 'supervisor.khalid@giki.edu.pk', hash: superHash,   name: 'Supervisor Khalid', role: 'supervisor', hostel: 'Hostel 2', room: null },
    { email: 'supervisor.rizwan@giki.edu.pk', hash: superHash,   name: 'Supervisor Rizwan', role: 'supervisor', hostel: 'Hostel 3', room: null },
    { email: 'kashif.ali@giki.edu.pk',        hash: techHash,    name: 'Kashif Ali',        role: 'technician', hostel: null,       room: null },
    { email: 'bilal.ahmad@giki.edu.pk',       hash: techHash,    name: 'Bilal Ahmad',       role: 'technician', hostel: null,       room: null },
    { email: 'usman.khan@giki.edu.pk',        hash: techHash,    name: 'Usman Khan',        role: 'technician', hostel: null,       room: null },
  ];

  for (const u of users) {
    await db.query(
      `INSERT INTO users (email, password_hash, name, role, hostel, room_number, is_demo)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [u.email, u.hash, u.name, u.role, u.hostel, u.room]
    );
  }
  console.log('✅ Demo users inserted');

  // ─── Complaints ─────────────────────────────────────────────────────────────
  const complaints = [
    {
      id: 'CN#147',
      category: 'Internet',
      urgency: 'High',
      status: 'Pending',
      description: 'No internet connection in room for 2 days. Unable to attend online classes and submit assignments.',
      room_number: '203-A',
      hostel: 'Hostel 1',
      student_name: 'Ahmed Raza',
      student_email: 'ahmed.raza@giki.edu.pk',
      created_at: '2026-05-01',
    },
    {
      id: 'CN#145',
      category: 'Plumbing',
      urgency: 'Medium',
      status: 'In Progress',
      description: 'Leaking faucet in bathroom causing water wastage',
      room_number: '203-A',
      hostel: 'Hostel 1',
      student_name: 'Ahmed Raza',
      student_email: 'ahmed.raza@giki.edu.pk',
      technician: 'Kashif Ali',
      work_id: 'WK2187',
      assigned_on: '2026-04-30',
      assigned_by: 'Supervisor Irfan',
      created_at: '2026-04-29',
    },
    {
      id: 'CN#143',
      category: 'Electrical',
      urgency: 'Medium',
      status: 'In Progress',
      description: 'Light flickering in study area making it difficult to study at night',
      room_number: '203-A',
      hostel: 'Hostel 1',
      student_name: 'Ahmed Raza',
      student_email: 'ahmed.raza@giki.edu.pk',
      technician: 'Bilal Ahmad',
      work_id: 'WK2185',
      assigned_on: '2026-04-28',
      assigned_by: 'Supervisor Irfan',
      created_at: '2026-04-27',
    },
    {
      id: 'CN#140',
      category: 'AC/Fan',
      urgency: 'Low',
      status: 'Resolved',
      description: 'Ceiling fan making unusual noise and vibrating',
      room_number: '203-A',
      hostel: 'Hostel 1',
      student_name: 'Ahmed Raza',
      student_email: 'ahmed.raza@giki.edu.pk',
      technician: 'Usman Khan',
      work_id: 'WK2180',
      assigned_on: '2026-04-26',
      assigned_by: 'Supervisor Irfan',
      resolved_on: '2026-04-27',
      rating: 5,
      created_at: '2026-04-25',
    },
  ];

  for (const c of complaints) {
    await db.query(
      `INSERT INTO complaints
         (id, category, urgency, status, description, room_number, hostel,
          student_name, student_email, technician, work_id, assigned_on,
          assigned_by, resolved_on, rating, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (id) DO NOTHING`,
      [
        c.id, c.category, c.urgency, c.status, c.description,
        c.room_number, c.hostel, c.student_name, c.student_email,
        c.technician || null, c.work_id || null,
        c.assigned_on || null, c.assigned_by || null,
        c.resolved_on || null, c.rating || null, c.created_at,
      ]
    );
  }
  console.log('✅ Demo complaints inserted');

  await db.pool.end();
  console.log('🎉 Seeding complete!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
