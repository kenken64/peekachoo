import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Enable standalone output for Docker deployment
	output: "standalone",

	// Disable image optimization for simpler deployment
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
