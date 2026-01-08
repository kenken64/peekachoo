// Polyfill TextEncoder/TextDecoder FIRST (required by undici)
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		prefetch: jest.fn(),
		back: jest.fn(),
	}),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:3000";
process.env.ADMIN_PASSWORD = "test-password";
