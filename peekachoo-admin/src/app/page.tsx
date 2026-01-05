'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

// Retro Counter Component
function RetroCounter({ value, label }: { value: number; label: string }) {
  const digits = value.toString().padStart(6, '0').split('');

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-1">
        {digits.map((digit, index) => (
          <div
            key={index}
            className="w-10 h-14 bg-black border-2 border-gray-600 rounded flex items-center justify-center shadow-inner"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,255,0,0.3)',
            }}
          >
            <span
              className="text-3xl font-mono font-bold"
              style={{
                color: '#00ff00',
                textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00',
                fontFamily: 'monospace',
              }}
            >
              {digit}
            </span>
          </div>
        ))}
      </div>
      <span className="text-gray-400 text-sm mt-2 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pokemon Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 30;

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Load users when authenticated or when search/page changes
  const loadUsers = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      const res = await fetch(`/api/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, searchQuery, currentPage]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  // Auto-refresh counter every 10 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadUsers();
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, loadUsers]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUsers([]);
      setSearchQuery('');
      setCurrentPage(1);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    loadUsers();
  };

  const handleDelete = async (userId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Reload users to get accurate count and pagination
        loadUsers();
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncPokemon = async () => {
    if (isSyncing) return;
    
    if (!confirm('This will sync all Pokemon data from PokeAPI. This process may take several minutes. Do you want to continue?')) {
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncProgress('Starting sync...');

    try {
      // Total Pokemon estimate
      const totalPokemon = 1350;
      const batchSize = 50;
      let syncedCount = 0;

      for (let offset = 0; offset < totalPokemon; offset += batchSize) {
        setSyncProgress(`Syncing batch ${offset + 1}-${Math.min(offset + batchSize, totalPokemon)}...`);
        
        const res = await fetch('/api/pokemon/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: batchSize, offset }),
        });

        if (!res.ok) {
          throw new Error(`Failed to sync batch at offset ${offset}`);
        }

        const data = await res.json();
        syncedCount += data.data?.inserted + data.data?.updated || 0;
        
        // If we got fewer items than requested, we might be done
        if (data.data?.totalAvailable && offset + batchSize >= data.data.totalAvailable) {
          break;
        }
      }

      setSyncStatus('success');
      setSyncProgress(`Successfully synced ${syncedCount} Pokemon!`);
    } catch (err: any) {
      console.error('Sync failed:', err);
      setSyncStatus('error');
      setSyncProgress(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Peekachoo Admin
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {actionLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Retro Counter */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Peekachoo Admin
          </h1>

          {/* Retro User Counter */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700 mb-6">
            <RetroCounter value={totalCount} label="Total Registered Users" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={loadUsers}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg transition-colors"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Display Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      {isLoading ? 'Loading users...' : searchQuery ? 'No users found matching your search' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-750">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">{user.username}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-gray-300">{user.display_name || '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className="text-gray-400 text-sm">{formatDate(user.created_at)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                        <span className="text-gray-500 text-xs font-mono">{user.id.substring(0, 8)}...</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        {deleteConfirm === user.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={actionLoading}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-sm rounded transition-colors"
                            >
                              {actionLoading ? '...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 text-sm rounded transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-600">
              <div className="text-sm text-gray-400">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm rounded transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm rounded transition-colors"
                >
                  Prev
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && goToPage(page)}
                    disabled={page === '...'}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : page === '...'
                        ? 'bg-gray-800 text-gray-500 cursor-default'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm rounded transition-colors"
                >
                  Next
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm rounded transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pokemon Management Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 mt-8">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>👾</span> Pokemon Management
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Sync Pokemon Database</h3>
                <p className="text-gray-400 text-sm">
                  Fetch latest Pokemon data (including Japanese names) from PokeAPI.
                  This process runs in batches to avoid timeouts.
                </p>
              </div>
              <button
                onClick={handleSyncPokemon}
                disabled={isSyncing}
                className={`px-4 py-2 rounded font-medium transition-colors flex items-center gap-2 ${
                  isSyncing
                    ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {isSyncing ? (
                  <>
                    <span className="animate-spin">↻</span> Syncing...
                  </>
                ) : (
                  <>
                    <span>↻</span> Sync Pokemon
                  </>
                )}
              </button>
            </div>

            {/* Sync Status */}
            {(syncStatus !== 'idle' || syncProgress) && (
              <div className={`mt-4 p-4 rounded border ${
                syncStatus === 'error' ? 'bg-red-900/20 border-red-800 text-red-200' :
                syncStatus === 'success' ? 'bg-green-900/20 border-green-800 text-green-200' :
                'bg-blue-900/20 border-blue-800 text-blue-200'
              }`}>
                <div className="flex items-center gap-2">
                  {syncStatus === 'syncing' && <span className="animate-pulse">●</span>}
                  {syncStatus === 'success' && <span>✓</span>}
                  {syncStatus === 'error' && <span>⚠</span>}
                  <span className="font-mono text-sm">{syncProgress}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          Peekachoo Admin Panel • Auto-refreshes every 10 seconds
        </div>
      </div>
    </div>
  );
}
