import { type NextRequest, NextResponse } from "next/server";
import { validatePassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { password } = body;

		if (!password) {
			return NextResponse.json(
				{ error: "Password is required" },
				{ status: 400 },
			);
		}

		if (!validatePassword(password)) {
			return NextResponse.json(
				{ error: "Invalid password", valid: false },
				{ status: 401 },
			);
		}

		return NextResponse.json({ valid: true });
	} catch (error) {
		console.error("Password verification error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
