const fs = require('fs');
const path = require('path');
const db = require('./db');

async function migrate() {
  console.log('Running database migrations...');
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  try {
    await db.query(schema);
    console.log('✅ Schema created successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

migrate();
