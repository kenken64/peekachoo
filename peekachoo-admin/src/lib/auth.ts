import { cookies } from "next/headers";
import { config } from "./config";

const AUTH_COOKIE_NAME = "admin_authenticated";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export function getAdminPassword(): string {
	return config.adminPassword;
}

export function validatePassword(password: string): boolean {
	return password === getAdminPassword();
}

export async function setAuthCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(AUTH_COOKIE_NAME, "true", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: COOKIE_MAX_AGE,
		path: "/",
	});
}

export async function removeAuthCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
	const cookieStore = await cookies();
	const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
	return authCookie?.value === "true";
}
