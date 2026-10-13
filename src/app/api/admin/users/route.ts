import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://187.126.124.110:8000';

/**
 * GET /api/admin/users - List all accounts from MongoDB
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const token = request.cookies.get('transearch_admin_session')?.value || '';
    const res = await fetch(`${PYTHON_BACKEND_URL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `transearch_admin_session=${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch accounts from backend' },
      { status: res.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Backend unreachable', details: err?.message },
      { status: 503 }
    );
  }
}

/**
 * POST /api/admin/users - Create new account in MongoDB
 */
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const token = request.cookies.get('transearch_admin_session')?.value || '';

    const res = await fetch(`${PYTHON_BACKEND_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cookie': `transearch_admin_session=${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to create account in MongoDB', details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users?username=xxx - Delete an account from MongoDB
 */
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Missing username parameter' }, { status: 400 });
    }

    const token = request.cookies.get('transearch_admin_session')?.value || '';
    const res = await fetch(`${PYTHON_BACKEND_URL}/api/admin/users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `transearch_admin_session=${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to delete account', details: err?.message },
      { status: 500 }
    );
  }
}
