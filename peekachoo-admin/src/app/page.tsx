"use client";

// v2.3 - sync fix deployed

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface User {
	id: string;
	username: string;
	display_name: string | null;
	created_at: string;
	updated_at: string;
	shields?: number;
	total_shields_purchased?: number;
	total_spent?: number;
	monthly_spent?: number;
	first_purchase_date?: string | null;
	purchase_reset_date?: string | null;
}

interface Purchase {
	id: string;
	amount: number;
	amount_sgd: number;
	quantity: number;
	currency: string;
	status: string;
	created_at: string;
	razorpay_payment_id?: string;
	shields_purchased?: number;
}

// Retro Counter Component
function RetroCounter({ value, label }: { value: number; label: string }) {
	const digits = value.toString().padStart(6, "0").split("");

	return (
		<div className="flex flex-col items-center">
			<div className="flex gap-1">
				{digits.map((digit, index) => (
					<div
						key={`digit-${index}-${digit}`}
						className="w-10 h-14 bg-black border-2 border-slate-600 rounded flex items-center justify-center shadow-inner"
						style={{
							boxShadow:
								"inset 0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,255,0,0.3)",
						}}
					>
						<span
							className="text-3xl font-mono font-bold"
							style={{
								color: "#00ff00",
								textShadow: "0 0 10px #00ff00, 0 0 20px #00ff00",
								fontFamily: "monospace",
							}}
						>
							{digit}
						</span>
					</div>
				))}
			</div>
			<span className="text-muted-foreground text-sm mt-2 uppercase tracking-wider">
				{label}
			</span>
		</div>
	);
}

export default function AdminPage() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [users, setUsers] = useState<User[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [totalShieldsSold, setTotalShieldsSold] = useState(0);
	const [actionLoading, setActionLoading] = useState(false);

	// Delete confirmation modal state
	const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);
	const [deletePassword, setDeletePassword] = useState("");
	const [deleteAgreement, setDeleteAgreement] = useState("");
	const [deleteError, setDeleteError] = useState("");

	// Purchase history modal state
	const [purchaseHistoryUser, setPurchaseHistoryUser] = useState<User | null>(
		null,
	);
	const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
	const [purchaseHistoryLoading, setPurchaseHistoryLoading] = useState(false);

	// Pokemon Sync State
	const [isSyncing, setIsSyncing] = useState(false);
	const [syncProgress, setSyncProgress] = useState("");
	const [syncStatus, setSyncStatus] = useState<
		"idle" | "syncing" | "success" | "error"
	>("idle");

	// Payment Sync State
	const [isPaymentSyncing, setIsPaymentSyncing] = useState(false);
	const [paymentSyncProgress, setPaymentSyncProgress] = useState("");
	const [paymentSyncStatus, setPaymentSyncStatus] = useState<
		"idle" | "syncing" | "success" | "error"
	>("idle");

	// Search and pagination state
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "asc" | "desc";
	}>({
		key: "total_spent",
		direction: "desc",
	});
	const pageSize = 30;

	// Check authentication status on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: checkAuth only needs to run once on mount
	useEffect(() => {
		checkAuth();
	}, []);

	// Load users when authenticated or when search/page changes
	const loadUsers = useCallback(async () => {
		if (!isAuthenticated) return;

		setIsLoading(true);
		try {
			const params = new URLSearchParams({
				search: searchQuery,
				page: currentPage.toString(),
				pageSize: pageSize.toString(),
				sortBy: sortConfig.key,
				sortOrder: sortConfig.direction,
			});

			const res = await fetch(`/api/users?${params}`);
			if (res.ok) {
				const data = await res.json();
				console.log(
					"[DEBUG] loadUsers response:",
					JSON.stringify(data, null, 2),
				);
				console.log(
					"[DEBUG] First user monthly_spent:",
					data.users?.[0]?.monthly_spent,
				);
				console.log(
					"[DEBUG] First user purchase_reset_date:",
					data.users?.[0]?.purchase_reset_date,
				);
				setUsers(data.users);
				setTotalCount(data.totalCount);
				setTotalShieldsSold(data.globalStats?.totalShields || 0);
				setTotalPages(data.totalPages);
			} else if (res.status === 401) {
				setIsAuthenticated(false);
			}
		} catch (err) {
			console.error("Failed to load users:", err);
		} finally {
			setIsLoading(false);
		}
	}, [isAuthenticated, searchQuery, currentPage, sortConfig]);

	useEffect(() => {
		if (isAuthenticated) {
			loadUsers();
		}
	}, [isAuthenticated, loadUsers]);

	// Auto-refresh counter every 10 seconds
	useEffect(() => {
		if (!isAuthenticated) return;

		const interval = setInterval(() => {
			loadUsers();
		}, 10000);

		return () => clearInterval(interval);
	}, [isAuthenticated, loadUsers]);

	const requestSort = (key: string) => {
		let direction: "asc" | "desc" = "asc";
		if (sortConfig.key === key && sortConfig.direction === "asc") {
			direction = "desc";
		}
		setSortConfig({ key, direction });
	};

	const getSortIcon = (key: string) => {
		if (sortConfig.key !== key)
			return <span className="text-muted-foreground/30 ml-2">↕</span>;
		return sortConfig.direction === "asc" ? (
			<span className="ml-2">↑</span>
		) : (
			<span className="ml-2">↓</span>
		);
	};

	const checkAuth = async () => {
		try {
			const res = await fetch("/api/auth/check");
			const data = await res.json();
			setIsAuthenticated(data.authenticated);
		} catch (err) {
			console.error("Auth check failed:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setActionLoading(true);

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password }),
			});

			if (res.ok) {
				setIsAuthenticated(true);
				setPassword("");
			} else {
				const data = await res.json();
				setError(data.error || "Login failed");
			}
		} catch (_err) {
			setError("Failed to connect to server");
		} finally {
			setActionLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", { method: "POST" });
			setIsAuthenticated(false);
			setUsers([]);
			setSearchQuery("");
			setCurrentPage(1);
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setCurrentPage(1); // Reset to first page on new search
		loadUsers();
	};

	const handleDelete = async (userId: string) => {
		// Validate password first
		if (!deletePassword) {
			setDeleteError("Please enter the admin password");
			return;
		}

		// Validate agreement text
		if (deleteAgreement.toLowerCase() !== "i agree to delete") {
			setDeleteError('Please type "I agree to delete" to confirm');
			return;
		}

		setActionLoading(true);
		setDeleteError("");

		try {
			// First verify the password
			const authRes = await fetch("/api/auth/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password: deletePassword }),
			});

			if (!authRes.ok) {
				setDeleteError("Invalid admin password");
				setActionLoading(false);
				return;
			}

			// Password verified, proceed with deletion
			const res = await fetch(`/api/users/${userId}`, {
				method: "DELETE",
			});

			if (res.ok) {
				// Reload users to get accurate count and pagination
				loadUsers();
				closeDeleteModal();
			} else {
				const data = await res.json();
				setDeleteError(data.error || "Failed to delete user");
			}
		} catch (err) {
			console.error("Delete failed:", err);
			setDeleteError("Failed to delete user");
		} finally {
			setActionLoading(false);
		}
	};

	const openDeleteModal = (user: User) => {
		setDeleteModalUser(user);
		setDeletePassword("");
		setDeleteAgreement("");
		setDeleteError("");
	};

	const closeDeleteModal = () => {
		setDeleteModalUser(null);
		setDeletePassword("");
		setDeleteAgreement("");
		setDeleteError("");
	};

	const handleShowPurchaseHistory = async (user: User) => {
		setPurchaseHistoryUser(user);
		setPurchaseHistoryLoading(true);
		try {
			const res = await fetch(`/api/users/${user.id}/purchases`);
			if (res.ok) {
				const data = await res.json();
				setPurchaseHistory(data.purchases || []);
			} else {
				setPurchaseHistory([]);
			}
		} catch (err) {
			console.error("Failed to fetch purchase history:", err);
			setPurchaseHistory([]);
		} finally {
			setPurchaseHistoryLoading(false);
		}
	};

	const closePurchaseHistoryModal = () => {
		setPurchaseHistoryUser(null);
		setPurchaseHistory([]);
	};

	const handleSyncPokemon = async () => {
		if (isSyncing) return;

		if (
			!confirm(
				"This will sync all Pokemon data from PokeAPI. This process may take several minutes. Do you want to continue?",
			)
		) {
			return;
		}

		setIsSyncing(true);
		setSyncStatus("syncing");
		setSyncProgress("Starting sync...");

		try {
			// Total Pokemon estimate
			const totalPokemon = 1350;
			const batchSize = 50;
			let syncedCount = 0;

			for (let offset = 0; offset < totalPokemon; offset += batchSize) {
				setSyncProgress(
					`Syncing batch ${offset + 1}-${Math.min(offset + batchSize, totalPokemon)}...`,
				);

				const res = await fetch("/api/pokemon/sync", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ limit: batchSize, offset }),
				});

				if (!res.ok) {
					throw new Error(`Failed to sync batch at offset ${offset}`);
				}

				const data = await res.json();
				syncedCount += data.data?.inserted + data.data?.updated || 0;

				// If we got fewer items than requested, we might be done
				if (
					data.data?.totalAvailable &&
					offset + batchSize >= data.data.totalAvailable
				) {
					break;
				}
			}

			setSyncStatus("success");
			setSyncProgress(`Successfully synced ${syncedCount} Pokemon!`);
		} catch (err: unknown) {
			console.error("Sync failed:", err);
			setSyncStatus("error");
			const message = err instanceof Error ? err.message : "Unknown error";
			setSyncProgress(`Sync failed: ${message}`);
		} finally {
			setIsSyncing(false);
		}
	};

	const handleSyncPayments = async () => {
		if (isPaymentSyncing) return;

		if (
			!confirm(
				"This will sync all payments from Razorpay (last 30 days) and recalculate user totals. Continue?",
			)
		) {
			return;
		}

		setIsPaymentSyncing(true);
		setPaymentSyncStatus("syncing");
		setPaymentSyncProgress("Fetching payments from Razorpay...");

		try {
			console.log("[DEBUG] Starting payment sync...");
			const res = await fetch("/api/payments/sync", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			console.log("[DEBUG] Sync response status:", res.status);

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Sync failed");
			}

			const data = await res.json();
			console.log("[DEBUG] Sync response data:", JSON.stringify(data, null, 2));
			const r = data.results;

			setPaymentSyncStatus("success");
			setPaymentSyncProgress(
				`Sync complete! Fetched: ${r.fetched}, Created: ${r.created}, Updated: ${r.updated}, Skipped: ${r.skipped}, Users recalculated: ${r.usersRecalculated}${r.errors.length > 0 ? `, Errors: ${r.errors.length}` : ""}`,
			);

			// Refresh the user list
			console.log("[DEBUG] Refreshing user list after sync...");
			loadUsers();
		} catch (err: unknown) {
			console.error("Payment sync failed:", err);
			setPaymentSyncStatus("error");
			const message = err instanceof Error ? err.message : "Unknown error";
			setPaymentSyncProgress(`Sync failed: ${message}`);
		} finally {
			setIsPaymentSyncing(false);
		}
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleString();
	};

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	// Generate page numbers for pagination
	const getPageNumbers = () => {
		const pages: { id: string; value: number | string }[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++)
				pages.push({ id: `page-${i}`, value: i });
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) pages.push({ id: `page-${i}`, value: i });
				pages.push({ id: "ellipsis-end", value: "..." });
				pages.push({ id: `page-${totalPages}`, value: totalPages });
			} else if (currentPage >= totalPages - 2) {
				pages.push({ id: "page-1", value: 1 });
				pages.push({ id: "ellipsis-start", value: "..." });
				for (let i = totalPages - 3; i <= totalPages; i++)
					pages.push({ id: `page-${i}`, value: i });
			} else {
				pages.push({ id: "page-1", value: 1 });
				pages.push({ id: "ellipsis-start", value: "..." });
				for (let i = currentPage - 1; i <= currentPage + 1; i++)
					pages.push({ id: `page-${i}`, value: i });
				pages.push({ id: "ellipsis-end", value: "..." });
				pages.push({ id: `page-${totalPages}`, value: totalPages });
			}
		}

		return pages;
	};

	if (isLoading && !isAuthenticated) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-foreground text-xl">Loading...</div>
			</div>
		);
	}

	// Login Form
	if (!isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-2xl text-center">
							Peekachoo Admin
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleLogin}>
							<div className="grid w-full items-center gap-4">
								<div className="flex flex-col space-y-1.5">
									<Label htmlFor="password">Admin Password</Label>
									<Input
										id="password"
										type="password"
										placeholder="Enter admin password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
								</div>
								{error && (
									<div className="p-3 bg-destructive/20 border border-destructive rounded-lg text-destructive-foreground text-sm">
										{error}
									</div>
								)}
								<Button
									type="submit"
									disabled={actionLoading}
									className="w-full"
								>
									{actionLoading ? "Logging in..." : "Login"}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Admin Dashboard
	return (
		<div className="min-h-screen bg-background p-4 md:p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				{/* Header with Retro Counter */}
				<div className="flex flex-col items-center gap-6">
					<h1 className="text-2xl md:text-3xl font-bold">Peekachoo Admin</h1>

					{/* Retro User Counter */}
					<div className="flex flex-wrap gap-4 justify-center">
						<Card className="p-6 bg-card">
							<RetroCounter value={totalCount} label="Total Registered Users" />
						</Card>
						<Card className="p-6 bg-card">
							<RetroCounter
								value={totalShieldsSold}
								label="Total Shields Sold"
							/>
						</Card>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3">
						<Link href="/payments">
							<Button variant="outline">💳 View All Payments</Button>
						</Link>
						<Button
							variant="secondary"
							onClick={loadUsers}
							disabled={isLoading}
						>
							{isLoading ? "Refreshing..." : "Refresh"}
						</Button>
						<Button variant="destructive" onClick={handleLogout}>
							Logout
						</Button>
					</div>
				</div>

				{/* Search Bar */}
				<div className="flex gap-3">
					<form onSubmit={handleSearch} className="flex gap-3 w-full">
						<Input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search by username..."
							className="flex-1"
						/>
						<Button type="submit">Search</Button>
						{searchQuery && (
							<Button
								variant="outline"
								type="button"
								onClick={() => {
									setSearchQuery("");
									setCurrentPage(1);
								}}
							>
								Clear
							</Button>
						)}
					</form>
				</div>

				{/* Users Table */}
				<Card>
					<div className="overflow-hidden rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										<button
											type="button"
											className="flex items-center font-bold hover:text-foreground"
											onClick={() => requestSort("username")}
										>
											Username {getSortIcon("username")}
										</button>
									</TableHead>
									<TableHead className="text-right">
										<div className="flex justify-end">
											<button
												type="button"
												className="flex items-center font-bold hover:text-foreground"
												onClick={() => requestSort("shields")}
											>
												Shields {getSortIcon("shields")}
											</button>
										</div>
									</TableHead>
									<TableHead className="text-right">
										<div className="flex justify-end">
											<button
												type="button"
												className="flex items-center font-bold hover:text-foreground"
												onClick={() => requestSort("monthly_spent")}
											>
												Monthly (SGD) {getSortIcon("monthly_spent")}
											</button>
										</div>
									</TableHead>
									<TableHead className="text-right">
										<div className="flex justify-end">
											<button
												type="button"
												className="flex items-center font-bold hover:text-foreground"
												onClick={() => requestSort("total_spent")}
											>
												Total (SGD) {getSortIcon("total_spent")}
											</button>
										</div>
									</TableHead>
									<TableHead className="hidden md:table-cell">
										<button
											type="button"
											className="flex items-center font-bold hover:text-foreground"
											onClick={() => requestSort("purchase_reset_date")}
										>
											Reset Date {getSortIcon("purchase_reset_date")}
										</button>
									</TableHead>
									<TableHead className="hidden md:table-cell text-center">
										Status
									</TableHead>
									<TableHead className="hidden lg:table-cell">
										<button
											type="button"
											className="flex items-center font-bold hover:text-foreground"
											onClick={() => requestSort("created_at")}
										>
											Created {getSortIcon("created_at")}
										</button>
									</TableHead>
									<TableHead className="hidden lg:table-cell">
										User ID
									</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.length === 0 ? (
									<TableRow>
										<TableCell colSpan={9} className="h-24 text-center">
											{isLoading
												? "Loading users..."
												: searchQuery
													? "No users found matching your search"
													: "No users found"}
										</TableCell>
									</TableRow>
								) : (
									users.map((user) => {
										const monthlySpent = user.monthly_spent || 0;
										const monthlyLimit = 50;
										const minShieldCost = 0.27;
										const remainingAllowance = monthlyLimit - monthlySpent;
										// User can purchase only if they have enough remaining for at least one shield
										const canPurchase = remainingAllowance >= minShieldCost;
										return (
											<TableRow key={user.id}>
												<TableCell className="font-medium">
													{user.username}
												</TableCell>
												<TableCell className="text-right font-mono">
													{user.total_shields_purchased || 0}
												</TableCell>
												<TableCell className="text-right font-mono text-blue-500">
													S${monthlySpent.toFixed(2)}
												</TableCell>
												<TableCell className="text-right">
													<button
														type="button"
														className="font-mono text-green-500 hover:text-green-400 hover:underline cursor-pointer"
														onClick={() => handleShowPurchaseHistory(user)}
													>
														S${(user.total_spent || 0).toFixed(2)}
													</button>
												</TableCell>
												<TableCell className="hidden md:table-cell text-muted-foreground">
													{user.purchase_reset_date
														? formatDate(user.purchase_reset_date)
														: "-"}
												</TableCell>
												<TableCell className="hidden md:table-cell text-center">
													{canPurchase ? (
														<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
															Allowed
														</span>
													) : (
														<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
															Limit Hit
														</span>
													)}
												</TableCell>
												<TableCell className="hidden lg:table-cell text-muted-foreground">
													{formatDate(user.created_at)}
												</TableCell>
												<TableCell className="hidden lg:table-cell text-muted-foreground font-mono text-xs">
													{user.id.substring(0, 8)}...
												</TableCell>
												<TableCell className="text-right">
													<Button
														size="sm"
														variant="ghost"
														className="text-destructive hover:text-destructive hover:bg-destructive/10"
														onClick={() => openDeleteModal(user)}
													>
														Delete
													</Button>
												</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					</div>
					{totalPages > 1 && (
						<div className="px-4 py-3 flex items-center justify-between border-t">
							<div className="text-sm text-muted-foreground">
								Showing {(currentPage - 1) * pageSize + 1} to{" "}
								{Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
								users
							</div>
							<div className="flex gap-1">
								<Button
									variant="outline"
									size="sm"
									onClick={() => goToPage(1)}
									disabled={currentPage === 1}
								>
									First
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => goToPage(currentPage - 1)}
									disabled={currentPage === 1}
								>
									Prev
								</Button>

								{getPageNumbers().map((page) => (
									<Button
										key={page.id}
										variant={page.value === currentPage ? "default" : "outline"}
										size="sm"
										onClick={() =>
											typeof page.value === "number" && goToPage(page.value)
										}
										disabled={page.value === "..."}
										className={
											page.value === "..."
												? "cursor-default border-none hover:bg-transparent"
												: ""
										}
									>
										{page.value}
									</Button>
								))}

								<Button
									variant="outline"
									size="sm"
									onClick={() => goToPage(currentPage + 1)}
									disabled={currentPage === totalPages}
								>
									Next
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => goToPage(totalPages)}
									disabled={currentPage === totalPages}
								>
									Last
								</Button>
							</div>
						</div>
					)}
				</Card>
				<Card>
					<CardHeader className="border-b bg-muted/20">
						<CardTitle className="flex items-center gap-2">
							<span>💳</span> Payment Sync
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-medium mb-1">
									Sync Razorpay Payments
								</h3>
								<p className="text-muted-foreground text-sm">
									Fetch payments from Razorpay (last 30 days) and reconcile with
									local database. This will update purchase records and
									recalculate user totals.
								</p>
							</div>
							<Button
								onClick={handleSyncPayments}
								disabled={isPaymentSyncing}
								className={
									isPaymentSyncing ? "" : "bg-green-600 hover:bg-green-500"
								}
							>
								{isPaymentSyncing ? (
									<>
										<span className="animate-spin mr-2">↻</span> Syncing...
									</>
								) : (
									<>
										<span className="mr-2">↻</span> Sync Payments
									</>
								)}
							</Button>
						</div>

						{/* Payment Sync Status */}
						{(paymentSyncStatus !== "idle" || paymentSyncProgress) && (
							<div
								className={`mt-4 p-4 rounded-md border ${
									paymentSyncStatus === "error"
										? "bg-destructive/20 border-destructive text-destructive"
										: paymentSyncStatus === "success"
											? "bg-green-500/20 border-green-500 text-green-500"
											: "bg-blue-500/20 border-blue-500 text-blue-500"
								}`}
							>
								<div className="flex items-center gap-2">
									{paymentSyncStatus === "syncing" && (
										<span className="animate-pulse">●</span>
									)}
									{paymentSyncStatus === "success" && <span>✓</span>}
									{paymentSyncStatus === "error" && <span>⚠</span>}
									<span className="font-mono text-sm">
										{paymentSyncProgress}
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="border-b bg-muted/20">
						<CardTitle className="flex items-center gap-2">
							<span>👾</span> Pokemon Management
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-medium mb-1">
									Sync Pokemon Database
								</h3>
								<p className="text-muted-foreground text-sm">
									Fetch latest Pokemon data (including Japanese and Chinese
									names) from PokeAPI. This process runs in batches to avoid
									timeouts.
								</p>
							</div>
							<Button
								onClick={handleSyncPokemon}
								disabled={isSyncing}
								className={isSyncing ? "" : "bg-purple-600 hover:bg-purple-500"}
							>
								{isSyncing ? (
									<>
										<span className="animate-spin mr-2">↻</span> Syncing...
									</>
								) : (
									<>
										<span className="mr-2">↻</span> Sync Pokemon
									</>
								)}
							</Button>
						</div>

						{/* Sync Status */}
						{(syncStatus !== "idle" || syncProgress) && (
							<div
								className={`mt-4 p-4 rounded-md border ${
									syncStatus === "error"
										? "bg-destructive/20 border-destructive text-destructive"
										: syncStatus === "success"
											? "bg-green-500/20 border-green-500 text-green-500"
											: "bg-blue-500/20 border-blue-500 text-blue-500"
								}`}
							>
								<div className="flex items-center gap-2">
									{syncStatus === "syncing" && (
										<span className="animate-pulse">●</span>
									)}
									{syncStatus === "success" && <span>✓</span>}
									{syncStatus === "error" && <span>⚠</span>}
									<span className="font-mono text-sm">{syncProgress}</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
				<div className="text-center text-muted-foreground text-sm">
					Peekachoo Admin Panel • Auto-refreshes every 10 seconds
				</div>
			</div>
			{purchaseHistoryUser && (
				<div
					className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
					onClick={closePurchaseHistoryModal}
					onKeyDown={(e) => e.key === "Escape" && closePurchaseHistoryModal()}
					role="presentation"
				>
					<div
						className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.key === "Escape" && closePurchaseHistoryModal()}
						role="dialog"
						aria-modal="true"
					>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-bold text-white">
								Purchase History: {purchaseHistoryUser.username}
							</h3>
							<button
								type="button"
								onClick={closePurchaseHistoryModal}
								className="text-gray-400 hover:text-white text-2xl"
							>
								&times;
							</button>
						</div>

						<div className="mb-4 p-3 bg-slate-800 rounded-md">
							<div className="grid grid-cols-2 gap-2 text-sm">
								<div>
									<span className="text-gray-400">Total Spent:</span>{" "}
									<span className="text-green-500 font-mono">
										S${(purchaseHistoryUser.total_spent || 0).toFixed(2)}
									</span>
								</div>
								<div>
									<span className="text-gray-400">Monthly Spent:</span>{" "}
									<span className="text-blue-500 font-mono">
										S${(purchaseHistoryUser.monthly_spent || 0).toFixed(2)}
									</span>
								</div>
								<div>
									<span className="text-gray-400">First Purchase:</span>{" "}
									<span className="text-gray-300">
										{purchaseHistoryUser.first_purchase_date
											? formatDate(purchaseHistoryUser.first_purchase_date)
											: "-"}
									</span>
								</div>
								<div>
									<span className="text-gray-400">Reset Date:</span>{" "}
									<span className="text-yellow-500">
										{purchaseHistoryUser.purchase_reset_date
											? formatDate(purchaseHistoryUser.purchase_reset_date)
											: "-"}
									</span>
								</div>
							</div>
						</div>

						{purchaseHistoryLoading ? (
							<div className="text-center py-8 text-gray-400">
								Loading purchases...
							</div>
						) : purchaseHistory.length === 0 ? (
							<div className="text-center py-8 text-gray-400">
								No purchases found
							</div>
						) : (
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-slate-700 text-left">
										<th className="py-2 px-2 text-gray-400">Date</th>
										<th className="py-2 px-2 text-gray-400 text-center">Qty</th>
										<th className="py-2 px-2 text-gray-400 text-right">
											Amount
										</th>
										<th className="py-2 px-2 text-gray-400">Payment ID</th>
									</tr>
								</thead>
								<tbody>
									{purchaseHistory.map((purchase) => (
										<tr
											key={purchase.id}
											className="border-b border-slate-800 hover:bg-slate-800"
										>
											<td className="py-2 px-2 text-gray-300">
												{formatDate(purchase.created_at)}
											</td>
											<td className="py-2 px-2 text-center text-white font-mono">
												{purchase.quantity}
											</td>
											<td className="py-2 px-2 text-right text-green-500 font-mono">
												S${purchase.amount_sgd.toFixed(2)}
											</td>
											<td className="py-2 px-2 text-gray-500 font-mono text-xs">
												{purchase.razorpay_payment_id?.substring(0, 16) || "-"}
												...
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}

						<div className="mt-4 text-right">
							<Button variant="outline" onClick={closePurchaseHistoryModal}>
								Close
							</Button>
						</div>
					</div>
				</div>
			)}
			{deleteModalUser && (
				<div
					className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
					onClick={closeDeleteModal}
					onKeyDown={(e) => e.key === "Escape" && closeDeleteModal()}
					role="presentation"
				>
					<div
						className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.key === "Escape" && closeDeleteModal()}
						role="dialog"
						aria-modal="true"
					>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-bold text-red-500">⚠️ Delete User</h3>
							<button
								type="button"
								onClick={closeDeleteModal}
								className="text-gray-400 hover:text-white text-2xl"
							>
								&times;
							</button>
						</div>

						<div className="mb-4 p-3 bg-red-950/30 border border-red-900 rounded-md">
							<p className="text-gray-300 mb-2">
								You are about to permanently delete user:
							</p>
							<p className="text-white font-bold text-lg">
								{deleteModalUser.username}
							</p>
							<p className="text-gray-400 text-sm mt-2">
								This action cannot be undone. All user data including purchases,
								scores, and achievements will be permanently deleted.
							</p>
						</div>

						<div className="space-y-4">
							<div>
								<label
									htmlFor="delete-password"
									className="block text-gray-400 text-sm mb-1"
								>
									Enter your admin password:
								</label>
								<input
									id="delete-password"
									type="password"
									value={deletePassword}
									onChange={(e) => setDeletePassword(e.target.value)}
									className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-red-500"
									placeholder="Admin password"
								/>
							</div>

							<div>
								<label
									htmlFor="delete-agreement"
									className="block text-gray-400 text-sm mb-1"
								>
									Type{" "}
									<span className="text-red-500 font-mono">
										I agree to delete
									</span>{" "}
									to confirm:
								</label>
								<input
									id="delete-agreement"
									type="text"
									value={deleteAgreement}
									onChange={(e) => setDeleteAgreement(e.target.value)}
									className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-red-500"
									placeholder="I agree to delete"
								/>
							</div>

							{deleteError && (
								<div className="p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
									{deleteError}
								</div>
							)}

							<div className="flex justify-end gap-2 pt-2">
								<Button variant="outline" onClick={closeDeleteModal}>
									Cancel
								</Button>
								<Button
									variant="destructive"
									onClick={() => handleDelete(deleteModalUser.id)}
									disabled={actionLoading}
								>
									{actionLoading ? "Deleting..." : "Delete User"}
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
