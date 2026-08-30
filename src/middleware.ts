import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Extremely basic in-memory rate limiter for a single server instance
// In a serverless environment (like Vercel), this state resets on every cold start
// and isn't shared across edge nodes, but it's a good baseline defense.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    
    let rateData = rateLimitMap.get(ip);
    
    if (!rateData) {
      rateData = { count: 0, lastReset: now };
      rateLimitMap.set(ip, rateData);
    }
    
    // Reset window
    if (now - rateData.lastReset > WINDOW_MS) {
      rateData.count = 0;
      rateData.lastReset = now;
    }
    
    rateData.count++;
    
    if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests' }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }
        }
      );
    }
  }

  // Set general security headers on all responses
  const response = NextResponse.next();
  
  // Set security headers to block MIME sniffing and restrict framing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
