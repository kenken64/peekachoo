import { type NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getUsers } from "@/lib/backendApi";

export async function GET(request: NextRequest) {
	try {
		// Check authentication
		const authenticated = await isAuthenticated();
		if (!authenticated) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get query parameters
		const searchParams = request.nextUrl.searchParams;
		const search = searchParams.get("search") || "";
		const page = parseInt(searchParams.get("page") || "1", 10);
		const pageSize = parseInt(searchParams.get("pageSize") || "30", 10);
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder =
			(searchParams.get("sortOrder") as "asc" | "desc") || "desc";

		// Validate pagination params
		const validPage = Math.max(1, page);
		const validPageSize = Math.min(Math.max(1, pageSize), 100); // Max 100 per page

		const result = await getUsers(
			search,
			validPage,
			validPageSize,
			sortBy,
			sortOrder,
		);

		// Transform to match frontend expected format
		// Frontend expects: { users: [...], totalCount: number, totalPages: number }
		// Users should have: id, username, display_name, created_at, updated_at
		return NextResponse.json({
			users: result.users.map((user) => ({
				id: user.id,
				username: user.username,
				display_name: user.displayName,
				created_at: user.createdAt,
				updated_at: user.updatedAt,
				total_shields_purchased: user.totalShields,
				total_spent: user.totalSpent,
				monthly_spent: user.monthlySpent,
				first_purchase_date: user.firstPurchaseDate,
				purchase_reset_date: user.purchaseResetDate,
			})),
			totalCount: result.pagination.total,
			totalPages: result.pagination.totalPages,
			globalStats: result.globalStats,
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 },
		);
	}
}
