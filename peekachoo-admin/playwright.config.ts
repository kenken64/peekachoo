import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for Admin Panel E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: "./e2e",

	/* Run tests in files in parallel */
	fullyParallel: true,

	/* Fail the build on CI if you accidentally left test.only in the source code */
	forbidOnly: !!process.env.CI,

	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,

	/* Opt out of parallel tests on CI for stability */
	workers: process.env.CI ? 1 : undefined,

	/* Reporter to use */
	reporter: [
		["html", { open: "never" }],
		["list"],
		...(process.env.CI ? [["github"] as const] : []),
	],

	/* Shared settings for all the projects below */
	use: {
		/* Base URL for tests */
		baseURL:
			process.env.ADMIN_URL ||
			"https://peekachoo-admin-production.up.railway.app/",

		/* Collect trace when retrying the failed test */
		trace: "on-first-retry",

		/* Capture screenshot on failure */
		screenshot: "only-on-failure",

		/* Record video on failure */
		video: "retain-on-failure",

		/* Timeout for each action */
		actionTimeout: 10000,

		/* Navigation timeout */
		navigationTimeout: 30000,
	},

	/* Global timeout for each test */
	timeout: 60000,

	/* Expect timeout */
	expect: {
		timeout: 10000,
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},

		// Uncomment to test on more browsers
		// {
		// 	name: 'firefox',
		// 	use: { ...devices['Desktop Firefox'] },
		// },
		// {
		// 	name: 'webkit',
		// 	use: { ...devices['Desktop Safari'] },
		// },

		/* Test against mobile viewports */
		// {
		// 	name: 'Mobile Chrome',
		// 	use: { ...devices['Pixel 5'] },
		// },
		// {
		// 	name: 'Mobile Safari',
		// 	use: { ...devices['iPhone 12'] },
		// },
	],

	/* Output folder for test artifacts */
	outputDir: "test-results/",
});
