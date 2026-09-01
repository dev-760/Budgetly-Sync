import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { query } from '@/lib/db';
import { signJWT } from '@/lib/auth';
import { getChallenge, deleteChallenge } from '@/lib/passkey-challenges';

const ORIGIN = (request: NextRequest) => request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function getClientDataChallenge(response: { clientDataJSON?: string } | undefined): string | undefined {
  if (!response?.clientDataJSON) return undefined;

  try {
    const parsed = JSON.parse(Buffer.from(response.clientDataJSON, 'base64url').toString('utf8')) as { challenge?: string };
    return parsed.challenge;
  } catch {
    return undefined;
  }
}

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

    const challenge = getClientDataChallenge(registrationResponse.response);
    if (!challenge) {
      return NextResponse.json(
        { error: 'Invalid registration response' },
        { status: 400 }
      );
    }

    const challengeData = getChallenge(challenge);
    if (!challengeData) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      );
    }

    const origin = ORIGIN(request);
    const rpId = new URL(origin).hostname;

    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
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