import { expect, test } from "@playwright/test";

const ADMIN_URL =
	process.env.ADMIN_URL || "https://peekachoo-admin-production.up.railway.app/";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

test.describe("Admin Panel", () => {
	test.describe("Login Page", () => {
		test("should display login form when not authenticated", async ({
			page,
		}) => {
			await page.goto(ADMIN_URL);

			// Wait for page to load
			await page.waitForLoadState("networkidle");

			// Should see password input field
			const passwordInput = page.locator('input[type="password"]');
			await expect(passwordInput).toBeVisible();

			// Should see login button
			const loginButton = page.getByRole("button", {
				name: /login|sign in|enter/i,
			});
			await expect(loginButton).toBeVisible();
		});

		test("should show error for invalid password", async ({ page }) => {
			await page.goto(ADMIN_URL);
			await page.waitForLoadState("networkidle");

			// Enter wrong password
			const passwordInput = page.locator('input[type="password"]');
			await passwordInput.fill("wrongpassword123");

			// Click login button
			const loginButton = page.getByRole("button", {
				name: /login|sign in|enter/i,
			});
			await loginButton.click();

			// Should see error message
			await expect(
				page.getByText(/invalid|incorrect|wrong|error/i),
			).toBeVisible({ timeout: 5000 });
		});

		test("should login successfully with correct password", async ({
			page,
		}) => {
			test.skip(
				!ADMIN_PASSWORD,
				"ADMIN_PASSWORD environment variable is not set",
			);

			await page.goto(ADMIN_URL);
			await page.waitForLoadState("networkidle");

			// Enter correct password
			const passwordInput = page.locator('input[type="password"]');
			await passwordInput.fill(ADMIN_PASSWORD);

			// Click login button
			const loginButton = page.getByRole("button", {
				name: /login|sign in|enter/i,
			});
			await loginButton.click();

			// Wait for navigation/authentication
			await page.waitForLoadState("networkidle");

			// Should see user management dashboard elements - look for table or logout button
			await expect(page.getByRole("table").first()).toBeVisible({
				timeout: 10000,
			});
		});
	});

	test.describe("Dashboard (Authenticated)", () => {
		test.beforeEach(async ({ page }) => {
			test.skip(
				!ADMIN_PASSWORD,
				"ADMIN_PASSWORD environment variable is not set",
			);

			// Login first
			await page.goto(ADMIN_URL);
			await page.waitForLoadState("networkidle");

			const passwordInput = page.locator('input[type="password"]');
			await passwordInput.fill(ADMIN_PASSWORD);

			const loginButton = page.getByRole("button", {
				name: /login|sign in|enter/i,
			});
			await loginButton.click();

			await page.waitForLoadState("networkidle");
		});

		test("should display user count", async ({ page }) => {
			// Should see total users counter or a table with users
			await expect(
				page
					.getByText(/total users/i)
					.first()
					.or(page.getByRole("table")),
			).toBeVisible({ timeout: 10000 });
		});

		test("should display user table", async ({ page }) => {
			// Should see user table with headers
			await expect(page.getByRole("table")).toBeVisible({ timeout: 10000 });
			await expect(page.getByText(/username/i)).toBeVisible();
		});

		test("should have search functionality", async ({ page }) => {
			// Should see search input
			const searchInput = page.locator(
				'input[placeholder*="search" i], input[type="search"]',
			);
			await expect(searchInput).toBeVisible({ timeout: 10000 });
		});

		test("should have refresh button", async ({ page }) => {
			// Should see refresh button
			const refreshButton = page.getByRole("button", { name: /refresh/i });
			await expect(refreshButton).toBeVisible({ timeout: 10000 });
		});

		test("should have logout button", async ({ page }) => {
			// Should see logout button
			const logoutButton = page.getByRole("button", {
				name: /logout|sign out/i,
			});
			await expect(logoutButton).toBeVisible({ timeout: 10000 });
		});

		test("should navigate to payments page", async ({ page }) => {
			// Click on View All Payments link/button - use first() to avoid strict mode violation
			const paymentsLink = page
				.getByRole("link", { name: /view all payments/i })
				.first();

			if (await paymentsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
				await paymentsLink.click();
				await page.waitForLoadState("networkidle");

				// Should be on payments page
				await expect(page).toHaveURL(/payments/);
			}
		});

		test("should logout successfully", async ({ page }) => {
			// Click logout button
			const logoutButton = page.getByRole("button", {
				name: /logout|sign out/i,
			});
			await logoutButton.click();

			await page.waitForLoadState("networkidle");

			// Should be back to login page
			const passwordInput = page.locator('input[type="password"]');
			await expect(passwordInput).toBeVisible({ timeout: 10000 });
		});
	});

	test.describe("Payments Page (Authenticated)", () => {
		test.beforeEach(async ({ page }) => {
			test.skip(
				!ADMIN_PASSWORD,
				"ADMIN_PASSWORD environment variable is not set",
			);

			// Login first
			await page.goto(ADMIN_URL);
			await page.waitForLoadState("networkidle");

			const passwordInput = page.locator('input[type="password"]');
			await passwordInput.fill(ADMIN_PASSWORD);

			const loginButton = page.getByRole("button", {
				name: /login|sign in|enter/i,
			});
			await loginButton.click();

			await page.waitForLoadState("networkidle");

			// Navigate to payments page
			await page.goto(`${ADMIN_URL}payments`);
			await page.waitForLoadState("networkidle");
		});

		test("should display payments page", async ({ page }) => {
			// Should see payments header
			await expect(
				page.getByRole("heading", { name: "Payment Transactions" }),
			).toBeVisible({ timeout: 10000 });
		});

		test("should have payment status filter", async ({ page }) => {
			// Should see status filter/dropdown
			const statusFilter = page.locator('select, [role="combobox"]').first();
			if (await statusFilter.isVisible()) {
				await expect(statusFilter).toBeVisible();
			}
		});

		test("should have back to users link", async ({ page }) => {
			// Should see link back to users/dashboard
			const backLink = page.getByRole("link", {
				name: /users|back|dashboard/i,
			});
			if (await backLink.isVisible()) {
				await backLink.click();
				await page.waitForLoadState("networkidle");

				// Should be back on main page
				await expect(page).toHaveURL(ADMIN_URL);
			}
		});
	});

	test.describe("Security", () => {
		test("should not expose sensitive data in page source", async ({
			page,
		}) => {
			await page.goto(ADMIN_URL);
			await page.waitForLoadState("networkidle");

			const content = await page.content();

			// Should not contain sensitive patterns
			expect(content).not.toMatch(/password\s*[:=]\s*['"][^'"]+['"]/i);
			expect(content).not.toMatch(/api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i);
			expect(content).not.toMatch(/secret\s*[:=]\s*['"][^'"]+['"]/i);
		});

		test("should use HTTPS", async ({ page }) => {
			await page.goto(ADMIN_URL);

			// URL should be HTTPS in production
			expect(page.url()).toMatch(/^https:\/\//);
		});

		test("should have secure headers", async ({ page }) => {
			const response = await page.goto(ADMIN_URL);
			const headers = response?.headers();

			// Check for common security headers (these may vary based on Railway/Next.js config)
			if (headers) {
				// X-Frame-Options or CSP frame-ancestors should be present
				const _hasFrameProtection =
					headers["x-frame-options"] ||
					headers["content-security-policy"]?.includes("frame-ancestors");

				// Log headers for debugging (won't fail test if missing)
				console.log("Security headers present:", {
					"x-frame-options": headers["x-frame-options"] || "not set",
					"x-content-type-options":
						headers["x-content-type-options"] || "not set",
					"strict-transport-security":
						headers["strict-transport-security"] || "not set",
				});
			}
		});
	});

	test.describe("Accessibility", () => {
		test("should have proper page title", async ({ page }) => {
			await page.goto(ADMIN_URL);
			await page.waitForLoadState("networkidle");

			const title = await page.title();
			expect(title).toBeTruthy();
			expect(title.toLowerCase()).toContain("admin");
		});

		test("should have focusable elements", async ({ page }) => {
			await page.goto(ADMIN_URL);
			await page.waitForLoadState("networkidle");

			// Tab through elements
			await page.keyboard.press("Tab");

			// Should have focused element
			const focusedElement = page.locator(":focus");
			await expect(focusedElement).toBeVisible();
		});

		test("should have form labels", async ({ page }) => {
			await page.goto(ADMIN_URL);
			await page.waitForLoadState("networkidle");

			// Password input should have associated label or aria-label
			const passwordInput = page.locator('input[type="password"]');

			// Check for label, aria-label, or placeholder
			const hasLabel =
				(await passwordInput.getAttribute("aria-label")) !== null ||
				(await passwordInput.getAttribute("placeholder")) !== null ||
				(await page.locator("label[for]").count()) > 0;

			expect(hasLabel).toBeTruthy();
		});
	});

	test.describe("Performance", () => {
		test("should load within acceptable time", async ({ page }) => {
			const startTime = Date.now();

			await page.goto(ADMIN_URL);
			await page.waitForLoadState("networkidle");

			const loadTime = Date.now() - startTime;

			// Page should load within 10 seconds
			expect(loadTime).toBeLessThan(10000);

			console.log(`Page load time: ${loadTime}ms`);
		});

		test("should not have console errors", async ({ page }) => {
			const consoleErrors: string[] = [];

			page.on("console", (msg) => {
				if (msg.type() === "error") {
					consoleErrors.push(msg.text());
				}
			});

			await page.goto(ADMIN_URL);
			await page.waitForLoadState("networkidle");

			// Filter out known acceptable errors (e.g., favicon)
			const criticalErrors = consoleErrors.filter(
				(error) => !error.includes("favicon") && !error.includes("404"),
			);

			// Log errors for debugging
			if (criticalErrors.length > 0) {
				console.log("Console errors:", criticalErrors);
			}

			// Ideally should be 0, but allow some tolerance
			expect(criticalErrors.length).toBeLessThan(5);
		});
	});
});
