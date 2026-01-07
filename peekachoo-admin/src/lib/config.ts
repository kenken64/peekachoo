import path from "node:path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Also try .env if .env.local doesn't exist
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
	adminPassword: process.env.ADMIN_PASSWORD || "admin123",
	// Backend API configuration
	backendUrl: process.env.BACKEND_URL || "http://localhost:3000",
	adminApiKey:
		process.env.ADMIN_API_KEY || "peekachoo-admin-api-key-change-in-production",
};
