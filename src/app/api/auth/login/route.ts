import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashToken, signJWT } from '@/lib/auth';
import { mockUsers } from '@/lib/mock-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, token } = body;

    if (!username || !token) {
      return NextResponse.json(
        { error: 'Username and token are required' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase();
    const tokenHash = hashToken(token);

    // Check if using mock storage (no database)
    if (!process.env.DATABASE_URL) {
      const user = mockUsers.get(normalizedUsername);
      if (!user || user.tokenHash !== tokenHash) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const jwt = await signJWT(normalizedUsername);

      return NextResponse.json({
        message: 'Login successful (mock mode)',
        username: normalizedUsername,
        jwt
      });
    }

    // Verify user and token in database
    const result = await query(
      'SELECT username FROM users WHERE username = $1 AND token_hash = $2',
      [normalizedUsername, tokenHash]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT
    const jwt = await signJWT(normalizedUsername);

    return NextResponse.json({
      message: 'Login successful',
      username: normalizedUsername,
      jwt
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}