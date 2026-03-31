/**
 * scripts/migrate.ts
 * One-time migration: reads shop.db (SQLite) → inserts into Supabase (Postgres)
 *
 * Run: npm run migrate
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import * as fs from 'fs'
import * as path from 'path'
import initSqlJs from 'sql.js'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const DB_PATH = path.resolve(process.cwd(), 'shop.db')

async function chunkInsert(table: string, rows: Record<string, unknown>[], batchSize = 500) {
  let inserted = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from(table).insert(batch)
    if (error) {
      console.error(`  ✗ Error inserting batch ${Math.floor(i / batchSize) + 1} into ${table}:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\r  → ${table}: ${inserted}/${rows.length} rows`)
    }
  }
  console.log()
}

function toBool(val: unknown): boolean | null {
  if (val === null || val === undefined) return null
  return val === 1 || val === true
}

async function main() {
  console.log('Loading shop.db …')
  const SQL = await initSqlJs()
  const fileBuffer = fs.readFileSync(DB_PATH)
  const db = new SQL.Database(fileBuffer)

  function queryAll(sql: string): Record<string, unknown>[] {
    const result = db.exec(sql)
    if (!result.length) return []
    const { columns, values } = result[0]
    return values.map((row) =>
      Object.fromEntries(columns.map((col, i) => [col, row[i]]))
    )
  }

  // ── customers ──────────────────────────────────────────────────────────────
  console.log('\nMigrating customers …')
  const customers = queryAll('SELECT * FROM customers').map((r) => ({
    ...r,
    is_active: toBool(r.is_active),
  }))
  await chunkInsert('customers', customers)

  // ── products ────────────────────────────────────────────────────────────────
  console.log('Migrating products …')
  const products = queryAll('SELECT * FROM products').map((r) => ({
    ...r,
    is_active: toBool(r.is_active),
  }))
  await chunkInsert('products', products)

  // ── orders ──────────────────────────────────────────────────────────────────
  console.log('Migrating orders …')
  const orders = queryAll('SELECT * FROM orders').map((r) => ({
    ...r,
    promo_used: toBool(r.promo_used),
    is_fraud:   toBool(r.is_fraud),
  }))
  await chunkInsert('orders', orders)

  // ── order_items ──────────────────────────────────────────────────────────────
  console.log('Migrating order_items …')
  const orderItems = queryAll('SELECT * FROM order_items')
  await chunkInsert('order_items', orderItems)

  // ── shipments ────────────────────────────────────────────────────────────────
  console.log('Migrating shipments …')
  const shipments = queryAll('SELECT * FROM shipments').map((r) => ({
    ...r,
    late_delivery: toBool(r.late_delivery),
    late_score: null,
  }))
  await chunkInsert('shipments', shipments)

  // ── product_reviews ──────────────────────────────────────────────────────────
  console.log('Migrating product_reviews …')
  const reviews = queryAll('SELECT * FROM product_reviews')
  await chunkInsert('product_reviews', reviews)

  db.close()
  console.log('\n✓ Migration complete.')
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
