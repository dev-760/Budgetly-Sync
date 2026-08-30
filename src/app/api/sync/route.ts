import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const MAX_PAYLOAD_SIZE = 1024 * 1024;

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

    const username = payload.username as string;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { syncData: true }
    });

    if (!user || !user.syncData) {
      return NextResponse.json({ data: {} });
    }

    const data = JSON.parse(user.syncData);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching sync state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const username = payload.username as string;

    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const rawText = await request.text();
    if (rawText.length > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

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

    // Secure Upsert on the User table (assuming user exists since they have a JWT)
    const user = await prisma.user.update({
      where: { username },
      data: {
        syncData: JSON.stringify(data),
      },
    });

    return NextResponse.json({ success: true, updatedAt: user.updatedAt });
  } catch (error) {
    console.error('Error saving sync state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}