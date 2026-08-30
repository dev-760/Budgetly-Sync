import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// If running in edge/serverless, ensure we use the environment variable
const connectionString = `${process.env.DATABASE_URL}`;

// Prisma v5/v6 requires a pg Pool for the adapter
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Initialize Prisma with the Postgres adapter
const prisma = new PrismaClient({ adapter });

export { prisma };
