/**
 * Tests for auth module
 */

// Mock next/headers
const mockCookieStore = {
	get: jest.fn(),
	set: jest.fn(),
	delete: jest.fn(),
};

jest.mock("next/headers", () => ({
	cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock config
jest.mock("@/lib/config", () => ({
	config: {
		adminPassword: "test-admin-password",
		backendUrl: "http://localhost:3000",
		adminApiKey: "test-api-key",
	},
}));

import {
	getAdminPassword,
	isAuthenticated,
	removeAuthCookie,
	setAuthCookie,
	validatePassword,
} from "@/lib/auth";

describe("Auth", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getAdminPassword", () => {
		it("should return the admin password from config", () => {
			const password = getAdminPassword();
			expect(password).toBe("test-admin-password");
		});
	});

	describe("validatePassword", () => {
		it("should return true for correct password", () => {
			const result = validatePassword("test-admin-password");
			expect(result).toBe(true);
		});

		it("should return false for incorrect password", () => {
			const result = validatePassword("wrong-password");
			expect(result).toBe(false);
		});

		it("should return false for empty password", () => {
			const result = validatePassword("");
			expect(result).toBe(false);
		});
	});

	describe("setAuthCookie", () => {
		it("should set the authentication cookie", async () => {
			await setAuthCookie();

			expect(mockCookieStore.set).toHaveBeenCalledWith(
				"admin_authenticated",
				"true",
				expect.objectContaining({
					httpOnly: true,
					sameSite: "strict",
					path: "/",
				}),
			);
		});

		it("should set maxAge to 24 hours", async () => {
			await setAuthCookie();

			expect(mockCookieStore.set).toHaveBeenCalledWith(
				expect.any(String),
				expect.any(String),
				expect.objectContaining({
					maxAge: 60 * 60 * 24, // 24 hours
				}),
			);
		});
	});

	describe("removeAuthCookie", () => {
		it("should delete the authentication cookie", async () => {
			await removeAuthCookie();

			expect(mockCookieStore.delete).toHaveBeenCalledWith(
				"admin_authenticated",
			);
		});
	});

	describe("isAuthenticated", () => {
		it("should return true when auth cookie is set to true", async () => {
			mockCookieStore.get.mockReturnValue({ value: "true" });

			const result = await isAuthenticated();

			expect(result).toBe(true);
			expect(mockCookieStore.get).toHaveBeenCalledWith("admin_authenticated");
		});

		it("should return false when auth cookie is not set", async () => {
			mockCookieStore.get.mockReturnValue(undefined);

			const result = await isAuthenticated();

			expect(result).toBe(false);
		});

		it("should return false when auth cookie has wrong value", async () => {
			mockCookieStore.get.mockReturnValue({ value: "false" });

			const result = await isAuthenticated();

			expect(result).toBe(false);
		});
	});
});
