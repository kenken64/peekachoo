import { config } from './config';

interface BackendUser {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  shields?: number;
  total_shields_purchased?: number;
  total_spent?: number;
  monthly_spent?: number;
  first_purchase_date?: string | null;
  purchase_reset_date?: string | null;
}

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface GlobalStats {
  totalShields: number;
  totalRevenue: number;
}

interface UsersResponse {
  success: boolean;
  data: {
    users: BackendUser[];
    globalStats?: GlobalStats;
    pagination: PaginationInfo;
  };
  error?: string;
}

interface UserResponse {
  success: boolean;
  data: BackendUser;
  error?: string;
}

interface DeleteResponse {
  success: boolean;
  message: string;
  deletedUserId: string;
  error?: string;
}

interface CountResponse {
  success: boolean;
  data: {
    total: number;
  };
  error?: string;
}

async function fetchBackend<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${config.backendUrl}/api/admin${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.adminApiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getUsers(
  search: string = '', 
  page: number = 1, 
  pageSize: number = 30,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const params = new URLSearchParams({
    search,
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortBy,
    sortOrder
  });

  const response = await fetchBackend<UsersResponse>(`/users?${params}`);

  // Transform to match the existing interface
  return {
    users: response.data.users.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      totalShields: user.total_shields_purchased || 0,
      totalSpent: user.total_spent || 0,
    })),
    globalStats: response.data.globalStats || { totalShields: 0, totalRevenue: 0 },
    pagination: response.data.pagination,
  };
}

export async function getUserById(id: string) {
  const response = await fetchBackend<UserResponse>(`/users/${id}`);

  return {
    id: response.data.id,
    username: response.data.username,
    displayName: response.data.display_name,
    createdAt: response.data.created_at,
    updatedAt: response.data.updated_at,
  };
}

export async function deleteUser(id: string) {
  const response = await fetchBackend<DeleteResponse>(`/users/${id}`, {
    method: 'DELETE',
  });

  return response;
}

export async function getUserCount() {
  const response = await fetchBackend<CountResponse>('/users/count');
  return response.data.total;
}

export async function syncPokemon(limit: number = 50, offset: number = 0) {
  const response = await fetchBackend<{ success: boolean; message: string; data: any }>('/pokemon/sync', {
    method: 'POST',
    body: JSON.stringify({ limit, offset }),
  });
  return response;
}
