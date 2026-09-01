import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { query } from '@/lib/db';
import { storeChallenge } from '@/lib/passkey-challenges';

const RP_ID = process.env.NEXT_PUBLIC_APP_URL 
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname 
  : 'localhost';
const RP_NAME = 'Budgetly';
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

    // Check if user exists
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

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: normalizedUsername,
      userName: normalizedUsername,
      // Don't prompt users for additional information about the authenticator
      excludeCredentials: passkeys.map((passkey: any) => ({
        id: passkey.id,
        type: 'public-key',
        transports: passkey.transports,
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
      },
    });

    // Store the challenge
    storeChallenge(options.challenge, normalizedUsername);
    
    return NextResponse.json(options);

  } catch (error) {
    console.error('Passkey registration options error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}