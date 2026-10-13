import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { verifyUserInDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const backendUrls = [
      process.env.PYTHON_BACKEND_URL,
      'http://localhost:8000',
      'http://127.0.0.1:8000',
    ].filter(Boolean) as string[];

    const uniqueBackendUrls = Array.from(new Set(backendUrls));

    // 1. Attempt authentication against Python MongoDB Backend API
    for (const backendUrl of uniqueBackendUrls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(`${backendUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const token = data.token || createSessionToken(username, data.user?.role || 'consultant');

          const response = NextResponse.json({
            success: true,
            message: 'Authentication successful',
            token,
            user: data.user || {
              username,
              role: 'consultant',
            },
          });

          response.cookies.set({
            name: ADMIN_COOKIE_NAME,
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
          });

          return response;
        } else if (res.status === 401) {
          // Explicit invalid credentials from Python backend
          break;
        }
      } catch {
        // Backend unreachable on this specific URL, try next candidate
      }
    }

    // 2. Direct MongoDB fallback (checks users collection in MongoDB directly)
    try {
      const dbUser = await verifyUserInDatabase(username, password);
      if (dbUser) {
        const token = createSessionToken(dbUser.username, dbUser.role);
        const response = NextResponse.json({
          success: true,
          message: 'Authentication successful',
          token,
          user: dbUser,
        });

        response.cookies.set({
          name: ADMIN_COOKIE_NAME,
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });

        return response;
      }
    } catch {
      // Direct MongoDB check unavailable
    }

    // 3. Fallback to hardcoded default admin credentials
    if (verifyCredentials(username, password)) {
      const token = createSessionToken(username || 'admin@transearch.com', 'superadmin');
      const response = NextResponse.json({
        success: true,
        message: 'Authentication successful',
        token,
        user: {
          username: username || 'admin@transearch.com',
          role: 'superadmin',
        },
      });

      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials. Access is restricted to authorized TRANSEARCH consultants.' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Authentication service error', details: error?.message },
      { status: 500 }
    );
  }
}
