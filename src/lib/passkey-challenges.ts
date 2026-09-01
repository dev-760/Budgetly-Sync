// Simple in-memory challenge storage
// In production, you'd use Redis or a database with TTL

interface ChallengeData {
  challenge: string;
  username: string;
  timestamp: number;
}

const challenges = new Map<string, ChallengeData>();
const CHALLENGE_TTL = 5 * 60 * 1000; // 5 minutes

export function storeChallenge(challenge: string, username: string): void {
  challenges.set(challenge, {
    challenge,
    username,
    timestamp: Date.now(),
  });
  
  // Clean up expired challenges periodically
  setTimeout(() => {
    const data = challenges.get(challenge);
    if (data && Date.now() - data.timestamp > CHALLENGE_TTL) {
      challenges.delete(challenge);
    }
  }, CHALLENGE_TTL);
}

export function getChallenge(challenge: string): ChallengeData | null {
  const data = challenges.get(challenge);
  if (!data) return null;
  
  // Check if expired
  if (Date.now() - data.timestamp > CHALLENGE_TTL) {
    challenges.delete(challenge);
    return null;
  }
  
  return data;
}

export function deleteChallenge(challenge: string): void {
  challenges.delete(challenge);
}

// Clean up expired challenges periodically
setInterval(() => {
  const now = Date.now();
  for (const [challenge, data] of challenges.entries()) {
    if (now - data.timestamp > CHALLENGE_TTL) {
      challenges.delete(challenge);
    }
  }
}, 60 * 1000); // Clean up every minute