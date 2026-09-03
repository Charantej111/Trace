import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

async function runMigration() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:Charantej%4061A4@db.xwisjciqnsigsrtfwdqh.supabase.co:5432/postgres';

  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Successfully connected to PostgreSQL database!');

    const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/20260831_init_trace_schema.sql');
    console.log(`Reading SQL schema from ${sqlPath}...`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing Trace master schema migration...');
    await client.query(sql);
    console.log('✓ Master schema applied successfully!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nCreated public tables:');
    res.rows.forEach(r => console.log(' -', r.table_name));

    // Ensure default workspace exists
    await client.query(`
      INSERT INTO workspaces (id, name, slug, product_name, product_category)
      VALUES ('ws-default', 'Default Workspace', 'default-workspace', 'Trace Intelligence', 'Product Decision Intelligence')
      ON CONFLICT (id) DO NOTHING;
    `).catch(() => {
      console.log('Default workspace insert note: handled.');
    });

  } catch (err: unknown) {
    const error = err as Error;
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();
