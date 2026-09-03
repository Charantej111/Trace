import pg from 'pg';

const { Client } = pg;

async function applyRLS() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:Charantej%4061A4@db.xwisjciqnsigsrtfwdqh.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const tables = [
    'workspaces',
    'workspace_members',
    'product_context',
    'feedback_sources',
    'imports',
    'customer_segments',
    'customers',
    'feedback',
    'feedback_atoms',
    'themes',
    'theme_atoms',
    'pain_points',
    'insights',
    'insight_evidence',
    'opportunities',
    'product_decisions',
    'roadmap_items',
    'processing_jobs',
    'processing_job_stages',
    'processing_job_items',
    'ai_runs'
  ];

  console.log('Applying open portfolio RLS policies...');

  for (const table of tables) {
    try {
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      await client.query(`DROP POLICY IF EXISTS "Allow public read-write on ${table}" ON ${table};`);
      await client.query(
        `CREATE POLICY "Allow public read-write on ${table}" ON ${table} FOR ALL USING (true) WITH CHECK (true);`
      );
      console.log(`✓ RLS configured for ${table}`);
    } catch (e: unknown) {
      const err = e as Error;
      console.warn(`Policy notice for ${table}:`, err.message);
    }
  }

  // Insert default workspace
  await client.query(`
    INSERT INTO workspaces (id, name, slug, product_name, product_category)
    VALUES ('ws-default', 'Default Workspace', 'default-workspace', 'Trace Intelligence', 'Product Decision Intelligence')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✓ Default workspace inserted in PostgreSQL');

  await client.end();
}

applyRLS().catch(console.error);
