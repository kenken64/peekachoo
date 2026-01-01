import Database from 'better-sqlite3';
import path from 'path';
import { config } from './config';

// Resolve the path relative to the project root
const resolvedPath = path.resolve(process.cwd(), config.databasePath);

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    try {
      db = new Database(resolvedPath, { readonly: false });
      db.pragma('journal_mode = WAL');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw new Error(`Failed to connect to database at ${resolvedPath}`);
    }
  }
  return db;
}

export interface User {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Credential {
  id: string;
  user_id: string;
  device_type: string | null;
  created_at: string;
}

export interface PaginatedUsersResult {
  users: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function getAllUsers(): User[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, username, display_name, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `);
  return stmt.all() as User[];
}

export function searchUsers(
  search: string = '',
  page: number = 1,
  pageSize: number = 30
): PaginatedUsersResult {
  const db = getDatabase();
  const offset = (page - 1) * pageSize;

  // Get total count with search filter
  let countQuery = 'SELECT COUNT(*) as count FROM users';
  let dataQuery = `
    SELECT id, username, display_name, created_at, updated_at
    FROM users
  `;

  const params: (string | number)[] = [];

  if (search.trim()) {
    const searchPattern = `%${search.trim()}%`;
    countQuery += ' WHERE username LIKE ?';
    dataQuery += ' WHERE username LIKE ?';
    params.push(searchPattern);
  }

  dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  // Get total count
  const countStmt = db.prepare(countQuery);
  const countResult = search.trim()
    ? (countStmt.get(params[0]) as { count: number })
    : (countStmt.get() as { count: number });
  const totalCount = countResult.count;

  // Get paginated data
  const dataStmt = db.prepare(dataQuery);
  const dataParams = search.trim()
    ? [params[0], pageSize, offset]
    : [pageSize, offset];
  const users = dataStmt.all(...dataParams) as User[];

  return {
    users,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export function getUserById(id: string): User | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function deleteUser(id: string): boolean {
  const db = getDatabase();

  // Delete in transaction to ensure all related data is removed
  const deleteTransaction = db.transaction((userId: string) => {
    // Delete credentials first (foreign key)
    db.prepare('DELETE FROM credentials WHERE user_id = ?').run(userId);

    // Delete challenges
    db.prepare('DELETE FROM challenges WHERE user_id = ?').run(userId);

    // Delete game sessions
    db.prepare('DELETE FROM game_sessions WHERE user_id = ?').run(userId);

    // Delete scores
    db.prepare('DELETE FROM scores WHERE user_id = ?').run(userId);

    // Delete the user
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    return result.changes > 0;
  });

  try {
    return deleteTransaction(id);
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

export function getUserCount(): number {
  const db = getDatabase();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const result = stmt.get() as { count: number };
  return result.count;
}

export function getCredentialsByUserId(userId: string): Credential[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT id, user_id, device_type, created_at FROM credentials WHERE user_id = ?');
  return stmt.all(userId) as Credential[];
}
