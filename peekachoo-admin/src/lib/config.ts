import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Also try .env if .env.local doesn't exist
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  databasePath: process.env.DATABASE_PATH || '../peekachoo-backend/data/peekachoo.db',
};
