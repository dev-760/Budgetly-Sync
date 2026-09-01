import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateToken, hashToken, signJWT } from '@/lib/auth';
import { mockUsers } from '@/lib/mock-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string' || !/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json(
        { error: 'Invalid username. Must be 3-20 alphanumeric characters.' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase();

    // Check if using mock storage (no database)
    if (!query.toString().includes('pool')) {
      if (mockUsers.has(normalizedUsername)) {
        return NextResponse.json(
          { error: 'Username already taken.' },
          { status: 409 }
        );
      }

      // Generate token and hash
      const token = generateToken();
      const tokenHash = hashToken(token);

      // Store in mock storage
      mockUsers.set(normalizedUsername, { tokenHash, token });

      // Generate JWT
      const jwt = await signJWT(normalizedUsername);

      return NextResponse.json({
        message: 'User created (mock mode)',
        username: normalizedUsername,
        token,
        jwt
      }, { status: 201 });
    }

    // Check if user already exists in database
    const existingUser = await query(
      'SELECT username FROM users WHERE username = $1',
      [normalizedUsername]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken.' },
        { status: 409 }
      );
    }

    // Generate token and hash
    const token = generateToken();
    const tokenHash = hashToken(token);

    // Create user
    await query(
      'INSERT INTO users (username, token, token_hash, passkeys, sync_data) VALUES ($1, $2, $3, $4, $5)',
      [normalizedUsername, token, tokenHash, '[]', null]
    );

    // Generate JWT
    const jwt = await signJWT(normalizedUsername);

    return NextResponse.json({
      message: 'User created',
      username: normalizedUsername,
      token,
      jwt
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}