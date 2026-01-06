import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${config.backendUrl}/api/admin/payments/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.adminApiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Sync failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to sync payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
