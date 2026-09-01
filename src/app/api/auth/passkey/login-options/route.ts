import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { query } from '@/lib/db';
import { storeChallenge } from '@/lib/passkey-challenges';

const getOrigin = (request: NextRequest) => request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase();
    const origin = getOrigin(request);
    const rpId = new URL(origin).hostname;

    // Get user's passkeys
    const userResult = await query(
      'SELECT username, passkeys FROM users WHERE username = $1',
      [normalizedUsername]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const passkeys = JSON.parse(user.passkeys || '[]');

    if (passkeys.length === 0) {
      return NextResponse.json(
        { error: 'No passkeys registered for this user' },
        { status: 400 }
      );
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID: rpId,
      userVerification: 'preferred',
      allowCredentials: passkeys.map((passkey: any) => ({
        id: passkey.id,
        type: 'public-key',
        transports: passkey.transports,
      })),
    });

    // Store the challenge
    storeChallenge(options.challenge, normalizedUsername);

    return NextResponse.json(options);

  } catch (error) {
    console.error('Passkey login options error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}