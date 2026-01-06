'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  total_shields_purchased?: number;
  total_spent?: number;
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
            className="w-10 h-14 bg-black border-2 border-slate-600 rounded flex items-center justify-center shadow-inner"
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
      <span className="text-muted-foreground text-sm mt-2 uppercase tracking-wider">{label}</span>
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
  const [totalShieldsSold, setTotalShieldsSold] = useState(0);
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
  const [sortConfig, setSortConfig] = useState<{key: string; direction: 'asc' | 'desc'}>({
    key: 'created_at',
    direction: 'desc'
  });
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
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      });

      const res = await fetch(`/api/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotalCount(data.totalCount);
        setTotalShieldsSold(data.globalStats?.totalShields || 0);
        setTotalPages(data.totalPages);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, searchQuery, currentPage, sortConfig]);

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

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: string) => {
      if (sortConfig.key !== key) return <span className="text-muted-foreground/30 ml-2">↕</span>;
      return sortConfig.direction === 'asc' ? <span className="ml-2">↑</span> : <span className="ml-2">↓</span>;
  };

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Peekachoo Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="p-3 bg-destructive/20 border border-destructive rounded-lg text-destructive-foreground text-sm">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={actionLoading} className="w-full">
                  {actionLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Retro Counter */}
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Peekachoo Admin
          </h1>

          {/* Retro User Counter */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Card className="p-6 bg-card">
              <RetroCounter value={totalCount} label="Total Registered Users" />
            </Card>
            <Card className="p-6 bg-card">
              <RetroCounter value={totalShieldsSold} label="Total Shields Sold" />
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={loadUsers}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex gap-3 w-full">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="flex-1"
            />
            <Button type="submit">
              Search
            </Button>
            {searchQuery && (
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </form>
        </div>

        {/* Users Table */}
        <Card>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button 
                      className="flex items-center font-bold hover:text-foreground"
                      onClick={() => requestSort('username')}
                    >
                      Username {getSortIcon('username')}
                    </button>
                  </TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead className="text-right">
                    <div className="flex justify-end">
                      <button 
                        className="flex items-center font-bold hover:text-foreground"
                        onClick={() => requestSort('shields')}
                      >
                        Shields {getSortIcon('shields')}
                      </button>
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex justify-end">
                      <button 
                        className="flex items-center font-bold hover:text-foreground"
                        onClick={() => requestSort('total_spent')}
                      >
                        Spent {getSortIcon('total_spent')}
                      </button>
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <button 
                      className="flex items-center font-bold hover:text-foreground"
                      onClick={() => requestSort('created_at')}
                    >
                      Created At {getSortIcon('created_at')}
                    </button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">User ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {isLoading ? 'Loading users...' : searchQuery ? 'No users found matching your search' : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.display_name || '-'}</TableCell>
                      <TableCell className="text-right font-mono">{user.total_shields_purchased || 0}</TableCell>
                      <TableCell className="text-right font-mono text-green-500">${(user.total_spent || 0).toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground font-mono text-xs">{user.id.substring(0, 8)}...</TableCell>
                      <TableCell className="text-right">
                        {deleteConfirm === user.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(user.id)}
                              disabled={actionLoading}
                            >
                              {actionLoading ? '...' : 'Confirm'}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteConfirm(user.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>

                {getPageNumbers().map((page, index) => (
                  <Button
                    key={index}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => typeof page === 'number' && goToPage(page)}
                    disabled={page === '...'}
                    className={page === '...' ? "cursor-default border-none hover:bg-transparent" : ""}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Pokemon Management Section */}
        <Card>
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2">
              <span>👾</span> Pokemon Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium mb-1">Sync Pokemon Database</h3>
                <p className="text-muted-foreground text-sm">
                  Fetch latest Pokemon data (including Japanese and Chinese names) from PokeAPI.
                  This process runs in batches to avoid timeouts.
                </p>
              </div>
              <Button
                onClick={handleSyncPokemon}
                disabled={isSyncing}
                className={isSyncing ? "" : "bg-purple-600 hover:bg-purple-500"}
              >
                {isSyncing ? (
                  <>
                    <span className="animate-spin mr-2">↻</span> Syncing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">↻</span> Sync Pokemon
                  </>
                )}
              </Button>
            </div>

            {/* Sync Status */}
            {(syncStatus !== 'idle' || syncProgress) && (
              <div className={`mt-4 p-4 rounded-md border ${
                syncStatus === 'error' ? 'bg-destructive/20 border-destructive text-destructive' :
                syncStatus === 'success' ? 'bg-green-500/20 border-green-500 text-green-500' :
                'bg-blue-500/20 border-blue-500 text-blue-500'
              }`}>
                <div className="flex items-center gap-2">
                  {syncStatus === 'syncing' && <span className="animate-pulse">●</span>}
                  {syncStatus === 'success' && <span>✓</span>}
                  {syncStatus === 'error' && <span>⚠</span>}
                  <span className="font-mono text-sm">{syncProgress}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm">
          Peekachoo Admin Panel • Auto-refreshes every 10 seconds
        </div>
      </div>
    </div>
  );
}
