import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { syncPokemon } from '@/lib/backendApi';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const limit = body.limit || 50;
    const offset = body.offset || 0;

    const result = await syncPokemon(limit, offset);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error syncing pokemon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync pokemon' },
      { status: 500 }
    );
  }
}
