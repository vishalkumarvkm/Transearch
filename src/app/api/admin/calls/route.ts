import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllInteractions, getCallStats, deleteInteraction } from '@/lib/callStorage';

/**
 * GET /api/admin/calls
 * Returns all recorded interactions with filtering and statistics.
 * Requires admin authentication.
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    // 1. Check Python MongoDB Backend if running
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://187.126.124.110:8000';
    try {
      const pyController = new AbortController();
      const pyTimeout = setTimeout(() => pyController.abort(), 1800);
      const token = request.cookies.get('transearch_admin_session')?.value || '';
      const pyUrl = `${pythonBackendUrl}/api/admin/calls?${searchParams.toString()}`;

      const pyRes = await fetch(pyUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cookie': `transearch_admin_session=${token}`,
        },
        signal: pyController.signal,
        cache: 'no-store',
      });
      clearTimeout(pyTimeout);

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        return NextResponse.json({
          ...pyData,
          source: 'Python MongoDB Backend',
        }, { status: 200 });
      }
    } catch {
      // Python backend unreachable; proceed with local storage fallback
    }

    const searchQuery = searchParams.get('search')?.toLowerCase().trim() || '';
    const agentFilter = searchParams.get('agent')?.trim() || '';
    const statusFilter = searchParams.get('status')?.trim() || '';

    let calls = await getAllInteractions();
    const stats = await getCallStats();

    // Apply agent filter
    if (agentFilter && agentFilter !== 'all') {
      calls = calls.filter((c) => 
        c.agentId === agentFilter || 
        c.agentName.toLowerCase().includes(agentFilter.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      calls = calls.filter((c) => c.status === statusFilter);
    }

    // Apply search filter across all fields
    if (searchQuery) {
      calls = calls.filter((c) => {
        const candidateName = c.candidateInfo?.name?.toLowerCase() || '';
        const candidateEmail = c.candidateInfo?.email?.toLowerCase() || '';
        const candidatePhone = c.candidateInfo?.phone?.toLowerCase() || '';
        const candidateNotes = c.candidateInfo?.notes?.toLowerCase() || '';
        const ip = c.ipAddress.toLowerCase();
        const city = c.geoLocation?.city?.toLowerCase() || '';
        const country = c.geoLocation?.country?.toLowerCase() || '';
        const agent = c.agentName.toLowerCase();
        const mandate = c.mandate.toLowerCase();
        
        // Search in transcripts
        const transcriptMatch = c.segments?.some((s) => s.text.toLowerCase().includes(searchQuery));

        return (
          candidateName.includes(searchQuery) ||
          candidateEmail.includes(searchQuery) ||
          candidatePhone.includes(searchQuery) ||
          candidateNotes.includes(searchQuery) ||
          ip.includes(searchQuery) ||
          city.includes(searchQuery) ||
          country.includes(searchQuery) ||
          agent.includes(searchQuery) ||
          mandate.includes(searchQuery) ||
          transcriptMatch
        );
      });
    }

    return NextResponse.json({
      success: true,
      calls,
      stats,
    }, { status: 200 });

  } catch (err: any) {
    console.error('[admin/calls] Error fetching calls:', err);
    return NextResponse.json(
      { error: 'Failed to fetch call records', details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/calls?id=xyz
 * Deletes a call record.
 */
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing interaction ID' }, { status: 400 });
    }

    // Also delete from Python MongoDB Backend if running
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://187.126.124.110:8000';
    try {
      const token = request.cookies.get('transearch_admin_session')?.value || '';
      await fetch(`${pythonBackendUrl}/api/admin/calls/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cookie': `transearch_admin_session=${token}`,
        },
      });
    } catch {
      // Python backend unreachable
    }

    const success = await deleteInteraction(id);
    return NextResponse.json({ success }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to delete call record', details: err?.message },
      { status: 500 }
    );
  }
}
