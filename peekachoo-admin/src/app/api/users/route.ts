import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getUsers } from '@/lib/backendApi';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '30', 10);

    // Validate pagination params
    const validPage = Math.max(1, page);
    const validPageSize = Math.min(Math.max(1, pageSize), 100); // Max 100 per page

    const result = await getUsers(search, validPage, validPageSize);

    // Transform to match frontend expected format
    // Frontend expects: { users: [...], totalCount: number, totalPages: number }
    // Users should have: id, username, display_name, created_at, updated_at
    return NextResponse.json({
      users: result.users.map(user => ({
        id: user.id,
        username: user.username,
        display_name: user.displayName,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      })),
      totalCount: result.pagination.total,
      totalPages: result.pagination.totalPages,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
