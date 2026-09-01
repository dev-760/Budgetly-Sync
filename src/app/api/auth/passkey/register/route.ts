import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { query } from '@/lib/db';
import { signJWT } from '@/lib/auth';
import { getChallenge, deleteChallenge } from '@/lib/passkey-challenges';

const RP_ID = process.env.NEXT_PUBLIC_APP_URL 
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname 
  : 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, registrationResponse } = body;

    if (!username || !registrationResponse) {
      return NextResponse.json(
        { error: 'Username and registration response are required' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase();

    // Get user
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

    // Retrieve the challenge from storage
    const challengeData = getChallenge(registrationResponse.response?.userChallenge || '');
    if (!challengeData) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      );
    }

    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Registration verification failed' },
        { status: 400 }
      );
    }

    const { credential } = verification.registrationInfo;

    // Add new passkey to user's passkeys
    const newPasskey = {
      id: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports || [],
    };

    const updatedPasskeys = [...passkeys, newPasskey];

    await query(
      'UPDATE users SET passkeys = $1 WHERE username = $2',
      [JSON.stringify(updatedPasskeys), normalizedUsername]
    );

    // Delete the used challenge
    deleteChallenge(challengeData.challenge);

    // Generate JWT
    const jwt = await signJWT(normalizedUsername);

    return NextResponse.json({
      message: 'Passkey registered successfully',
      jwt
    });

  } catch (error) {
    console.error('Passkey registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}