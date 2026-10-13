import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'transearch_admin_session';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin@transearch.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'transearch2025';
const SESSION_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SESSION_SECRET || 'transearch-executive-secret-key-2025-secure';

export interface AdminSession {
  username: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Validates login credentials against configured or default admin credentials
 */
export function verifyCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  
  const normalizedUser = username.trim().toLowerCase();
  const configuredUser = ADMIN_USERNAME.toLowerCase();

  // Allow either exact username or 'admin' as alias
  const userMatches = normalizedUser === configuredUser || normalizedUser === 'admin';
  const passMatches = password === ADMIN_PASSWORD;

  return userMatches && passMatches;
}

/**
 * Creates a cryptographically signed session token
 */
export function createSessionToken(username: string = 'admin@transearch.com', role: string = 'consultant'): string {
  const sessionData: AdminSession = {
    username,
    role,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const payload = Buffer.from(JSON.stringify(sessionData)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

/**
 * Verifies if a session token string is valid and not expired
 */
export function verifySessionToken(token?: string | null): AdminSession | null {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as AdminSession;

    // Check expiration
    if (Date.now() > decoded.expiresAt) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Checks authentication status from a NextRequest
 */
export function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (!cookie?.value) return false;
  return verifySessionToken(cookie.value) !== null;
}
