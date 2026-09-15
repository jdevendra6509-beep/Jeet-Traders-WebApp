import { writeFileSync, mkdirSync } from 'node:fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Run with: node --env-file=.env.local scripts/export-supabase.mjs');
  process.exit(1);
}

const outDir = new URL('../migration-data/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const tables = ['customers', 'items', 'invoices'];

for (const table of tables) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  if (!res.ok) {
    console.error(`Failed to export ${table}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const data = await res.json();
  writeFileSync(new URL(`${table}.json`, outDir), JSON.stringify(data, null, 2));
  console.log(`Exported ${data.length} rows from ${table}`);
}
