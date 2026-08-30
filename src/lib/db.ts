import { prisma } from './prisma';

export async function query(text: string, params?: any[]) {
  try {
    // Convert $1, $2 to Prisma parameterized query or use Prisma's executeRaw
    // Prisma's $queryRawUnsafe allows raw SQL with parameters, but the parameter syntax is different.
    // However, it's safer to just adapt it, or we can use the `pg` driver directly.
    // Let's use `pg` directly to ensure 100% compatibility with their old code.
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default { query };
