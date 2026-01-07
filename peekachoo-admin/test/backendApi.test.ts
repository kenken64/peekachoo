/**
 * Tests for backendApi module
 * Note: These tests mock fetch to avoid actual network calls
 */

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock config
jest.mock('@/lib/config', () => ({
  config: {
    backendUrl: 'http://localhost:3000',
    adminApiKey: 'test-api-key',
    adminPassword: 'test-password',
  },
}));

import {
  getUsers,
  getUserById,
  deleteUser,
  getUserCount,
  syncPokemon,
  getUserPurchases,
  getAllPayments,
} from '@/lib/backendApi';

describe('BackendApi', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getUsers', () => {
    it('should fetch users with default parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          users: [
            {
              id: '1',
              username: 'testuser',
              display_name: 'Test User',
              created_at: '2024-01-01',
              updated_at: '2024-01-01',
              total_shields_purchased: 10,
              total_spent: 100,
              monthly_spent: 50,
              first_purchase_date: '2024-01-01',
              purchase_reset_date: null,
            },
          ],
          globalStats: { totalShields: 100, totalRevenue: 1000 },
          pagination: {
            total: 1,
            page: 1,
            pageSize: 30,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getUsers();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].username).toBe('testuser');
      expect(result.globalStats.totalShields).toBe(100);
    });

    it('should pass search and pagination parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          users: [],
          globalStats: { totalShields: 0, totalRevenue: 0 },
          pagination: {
            total: 0,
            page: 2,
            pageSize: 10,
            totalPages: 0,
            hasNext: false,
            hasPrev: true,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await getUsers('search-term', 2, 10, 'username', 'asc');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=search-term'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
    });

    it('should handle missing globalStats in response', async () => {
      const mockResponse = {
        success: true,
        data: {
          users: [],
          pagination: {
            total: 0,
            page: 1,
            pageSize: 30,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getUsers();

      expect(result.globalStats).toEqual({ totalShields: 0, totalRevenue: 0 });
    });
  });

  describe('getUserById', () => {
    it('should fetch a single user by ID', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '123',
          username: 'testuser',
          display_name: 'Test User',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getUserById('123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/123'),
        expect.any(Object)
      );
      expect(result.id).toBe('123');
      expect(result.username).toBe('testuser');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      const mockResponse = {
        success: true,
        message: 'User deleted',
        deletedUserId: '123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await deleteUser('123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/123'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.success).toBe(true);
      expect(result.deletedUserId).toBe('123');
    });
  });

  describe('getUserCount', () => {
    it('should return total user count', async () => {
      const mockResponse = {
        success: true,
        data: { total: 42 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getUserCount();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/count'),
        expect.any(Object)
      );
      expect(result).toBe(42);
    });
  });

  describe('syncPokemon', () => {
    it('should sync pokemon with default parameters', async () => {
      const mockResponse = {
        success: true,
        message: 'Pokemon synced',
        data: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await syncPokemon();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/pokemon/sync'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ limit: 50, offset: 0 }),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should sync pokemon with custom parameters', async () => {
      const mockResponse = {
        success: true,
        message: 'Pokemon synced',
        data: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await syncPokemon(100, 50);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ limit: 100, offset: 50 }),
        })
      );
    });
  });

  describe('getUserPurchases', () => {
    it('should fetch purchases for a user', async () => {
      const mockResponse = {
        purchases: [
          {
            id: 'p1',
            quantity: 10,
            amount_sgd: 9.99,
            razorpay_order_id: 'order_123',
            razorpay_payment_id: 'pay_123',
            status: 'completed',
            created_at: '2024-01-01',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getUserPurchases('user123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/user123/purchases'),
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');
    });
  });

  describe('getAllPayments', () => {
    it('should fetch all payments with default parameters', async () => {
      const mockResponse = {
        payments: [],
        totalCount: 0,
        totalPages: 0,
        totalRevenue: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getAllPayments();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/payments'),
        expect.any(Object)
      );
      expect(result.payments).toEqual([]);
    });

    it('should pass filter parameters', async () => {
      const mockResponse = {
        payments: [],
        totalCount: 0,
        totalPages: 0,
        totalRevenue: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await getAllPayments('search', 'completed', 2, 25);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=search'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=completed'),
        expect.any(Object)
      );
    });
  });

  describe('Error handling', () => {
    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      await expect(getUsers()).rejects.toThrow('Server error');
    });

    it('should handle json parse error on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Parse error')),
      });

      await expect(getUsers()).rejects.toThrow('Request failed');
    });

    it('should use HTTP status when error.error is not present', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });

      await expect(getUsers()).rejects.toThrow('HTTP 404');
    });

    it('should handle user with missing optional fields', async () => {
      const mockResponse = {
        success: true,
        data: {
          users: [
            {
              id: '1',
              username: 'testuser',
              display_name: null,
              created_at: '2024-01-01',
              updated_at: '2024-01-01',
              // Missing optional fields: total_shields_purchased, total_spent, monthly_spent
            },
          ],
          globalStats: { totalShields: 100, totalRevenue: 1000 },
          pagination: {
            total: 1,
            page: 1,
            pageSize: 30,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getUsers();

      expect(result.users[0].totalShields).toBe(0);
      expect(result.users[0].totalSpent).toBe(0);
      expect(result.users[0].monthlySpent).toBe(0);
    });
  });

  describe('Request headers', () => {
    it('should include API key and content type in headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { total: 0 } }),
      });

      await getUserCount();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key',
          }),
        })
      );
    });
  });
});
