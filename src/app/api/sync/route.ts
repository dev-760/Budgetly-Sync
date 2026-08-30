import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { z } from 'zod';

const prisma = new PrismaClient().$extends(withAccelerate());

// Maximum payload size for the sync endpoint (1MB)
const MAX_PAYLOAD_SIZE = 1024 * 1024;

// Simple Zod validation to ensure the body is roughly correct without fully parsing the complex BudgetData
const SyncDataSchema = z.object({
  data: z.record(z.string(), z.any()),
});

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);
    
    if (!payload?.username) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.username;

    // Find the sync state
    const syncState = await prisma.syncState.findUnique({
      where: { userId },
    });

    if (!syncState) {
      return NextResponse.json({ data: {} });
    }

    const data = JSON.parse(syncState.state);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching sync state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authorize
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);
    
    if (!payload?.username) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.username;

    // 2. Validate Size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const rawText = await request.text();
    if (rawText.length > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    // 3. Parse and Validate Input Shape
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validationResult = SyncDataSchema.safeParse(parsedBody);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid payload schema' }, { status: 400 });
    }

    const { data } = validationResult.data;

    // 4. Lazy user creation
    let user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: userId,
          passwordHash: 'placeholder', 
        }
      });
    }

    // 5. Secure Upsert
    const syncState = await prisma.syncState.upsert({
      where: { userId },
      update: {
        state: JSON.stringify(data),
      },
      create: {
        userId,
        state: JSON.stringify(data),
      },
    });

    return NextResponse.json({ success: true, updatedAt: syncState.updatedAt });
  } catch (error) {
    console.error('Error saving sync state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}