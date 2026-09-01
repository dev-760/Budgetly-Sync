import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
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
    const { username, authenticationResponse } = body;

    if (!username || !authenticationResponse) {
      return NextResponse.json(
        { error: 'Username and authentication response are required' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase();

    // Get user and passkeys
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

    // Find the matching passkey
    const passkey = passkeys.find((pk: any) => pk.id === authenticationResponse.id);

    if (!passkey) {
      return NextResponse.json(
        { error: 'Passkey not found' },
        { status: 400 }
      );
    }

    // Retrieve the challenge from storage
    const challengeData = getChallenge(authenticationResponse.response?.userChallenge || '');
    if (!challengeData) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      );
    }

    // Verify authentication response
    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: passkey.id,
        publicKey: passkey.publicKey,
        counter: passkey.counter,
        transports: passkey.transports,
      },
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 400 }
      );
    }

    // Update counter
    const updatedPasskeys = passkeys.map((pk: any) => 
      pk.id === passkey.id 
        ? { ...pk, counter: verification.authenticationInfo.newCounter }
        : pk
    );

    await query(
      'UPDATE users SET passkeys = $1 WHERE username = $2',
      [JSON.stringify(updatedPasskeys), normalizedUsername]
    );

    // Delete the used challenge
    deleteChallenge(challengeData.challenge);

    // Generate JWT
    const jwt = await signJWT(normalizedUsername);

    return NextResponse.json({
      message: 'Passkey login successful',
      jwt
    });

  } catch (error) {
    console.error('Passkey login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}