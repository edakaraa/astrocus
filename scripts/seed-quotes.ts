/**
 * Seed public.quotes from scripts/quotes.json (service role).
 *
 * Run from project root:
 *   npx ts-node scripts/seed-quotes.ts
 *
 * Env (backend/.env or root .env):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * quotes.json shape:
 *   [{ "text_en": "...", "text_tr": "...", "author": "...", "order_index": 1 }, ...]
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const scriptsDir = __dirname;
const projectRoot = path.join(scriptsDir, '..');
const backendRoot = path.join(projectRoot, 'backend');
const requireFromBackend = createRequire(path.join(backendRoot, 'package.json'));

const { createClient } = requireFromBackend('@supabase/supabase-js');
const dotenv = requireFromBackend('dotenv');

dotenv.config({ path: path.join(backendRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const BATCH_SIZE = 100;

type QuoteRow = {
  text_en: string;
  text_tr: string;
  author: string;
  order_index: number;
};

function loadQuotes(): QuoteRow[] {
  const quotesPath = path.join(scriptsDir, 'quotes.json');

  if (!fs.existsSync(quotesPath)) {
    console.error(`Quotes file not found: ${quotesPath}`);
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(quotesPath, 'utf-8'));
  } catch (err) {
    console.error(`Failed to parse ${quotesPath}:`, err instanceof Error ? err.message : err);
    process.exit(1);
  }

  if (!Array.isArray(parsed)) {
    console.error('quotes.json must be a JSON array');
    process.exit(1);
  }

  return parsed as QuoteRow[];
}

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
    process.exit(1);
  }

  const quotes = loadQuotes();
  if (quotes.length === 0) {
    console.log('No quotes to insert (quotes.json is empty).');
    return;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let totalInserted = 0;

  for (let i = 0; i < quotes.length; i += BATCH_SIZE) {
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const batch = quotes.slice(i, i + BATCH_SIZE);
    const recordStart = i + 1;
    const recordEnd = i + batch.length;

    const { error } = await supabase.from('quotes').insert(batch);

    if (error) {
      console.error(
        `Batch ${batchNumber} failed (records ${recordStart}–${recordEnd}):`,
        error.message,
      );
      if (error.details) console.error('Details:', error.details);
      if (error.hint) console.error('Hint:', error.hint);
      process.exit(1);
    }

    totalInserted += batch.length;
    console.log(`Batch ${batchNumber}: inserted ${batch.length} quotes`);
  }

  console.log(`Done. Total quotes inserted: ${totalInserted}`);
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
