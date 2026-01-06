import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getUserPurchases } from '@/lib/backendApi';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const purchases = await getUserPurchases(id);
    return NextResponse.json({ purchases });
  } catch (error: any) {
    console.error('Failed to fetch purchase history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
