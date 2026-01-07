import { type NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getUserPurchases } from "@/lib/backendApi";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const authenticated = await isAuthenticated();
	if (!authenticated) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { id } = await params;
		const purchases = await getUserPurchases(id);
		return NextResponse.json({ purchases });
	} catch (error: unknown) {
		console.error("Failed to fetch purchase history:", error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
