"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Payment {
	id: string;
	user_id: string;
	username: string;
	quantity: number;
	amount_sgd: number;
	razorpay_order_id: string;
	razorpay_payment_id: string;
	status: string;
	created_at: string;
}

export default function PaymentsPage() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [payments, setPayments] = useState<Payment[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [totalRevenue, setTotalRevenue] = useState(0);
	const pageSize = 50;

	// Check authentication status on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: checkAuth only needs to run once on mount
	useEffect(() => {
		checkAuth();
	}, []);

	const loadPayments = useCallback(async () => {
		if (!isAuthenticated) return;

		setIsLoading(true);
		try {
			const params = new URLSearchParams({
				search: searchQuery,
				status: statusFilter,
				page: currentPage.toString(),
				pageSize: pageSize.toString(),
			});

			const res = await fetch(`/api/payments?${params}`);
			if (res.ok) {
				const data = await res.json();
				setPayments(data.payments);
				setTotalCount(data.totalCount);
				setTotalPages(data.totalPages);
				setTotalRevenue(data.totalRevenue);
			} else if (res.status === 401) {
				setIsAuthenticated(false);
			}
		} catch (err) {
			console.error("Failed to load payments:", err);
		} finally {
			setIsLoading(false);
		}
	}, [isAuthenticated, searchQuery, statusFilter, currentPage]);

	useEffect(() => {
		if (isAuthenticated) {
			loadPayments();
		}
	}, [isAuthenticated, loadPayments]);

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
				setError("Invalid password");
			}
		} catch (_err) {
			setError("Login failed");
		}
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleString();
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "settled":
				return (
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
						Settled
					</span>
				);
			case "captured":
				return (
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
						Captured
					</span>
				);
			case "pending":
				return (
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
						Pending
					</span>
				);
			case "failed":
				return (
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
						Failed
					</span>
				);
			case "refunded":
				return (
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						Refunded
					</span>
				);
			case "completed":
				return (
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
						Captured
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
						{status}
					</span>
				);
		}
	};

	if (isLoading && !isAuthenticated) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border">
					<h1 className="text-2xl font-bold text-center">Peekachoo Admin</h1>
					<form onSubmit={handleLogin} className="space-y-4">
						<Input
							type="password"
							placeholder="Enter admin password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						{error && <p className="text-destructive text-sm">{error}</p>}
						<Button type="submit" className="w-full">
							Login
						</Button>
					</form>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold text-primary">
						Payment Transactions
					</h1>
					<div className="flex gap-4">
						<Link href="/">
							<Button variant="outline">← Back to Users</Button>
						</Link>
						<Button onClick={loadPayments} disabled={isLoading}>
							{isLoading ? "Loading..." : "Refresh"}
						</Button>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="bg-card border rounded-lg p-4">
						<div className="text-sm text-muted-foreground">
							Total Transactions
						</div>
						<div className="text-2xl font-bold text-primary">{totalCount}</div>
					</div>
					<div className="bg-card border rounded-lg p-4">
						<div className="text-sm text-muted-foreground">
							Total Revenue (SGD)
						</div>
						<div className="text-2xl font-bold text-green-500">
							S${totalRevenue.toFixed(2)}
						</div>
					</div>
					<div className="bg-card border rounded-lg p-4">
						<div className="text-sm text-muted-foreground">Current Page</div>
						<div className="text-2xl font-bold">
							{currentPage} / {totalPages}
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className="flex gap-4 items-center">
					<Input
						placeholder="Search by username or payment ID..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="max-w-md"
					/>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="bg-background border rounded-md px-3 py-2"
					>
						<option value="all">All Status</option>
						<option value="settled">Settled</option>
						<option value="captured">Captured</option>
						<option value="pending">Pending</option>
						<option value="failed">Failed</option>
						<option value="refunded">Refunded</option>
					</select>
					<Button
						onClick={() => {
							setSearchQuery("");
							setStatusFilter("all");
						}}
					>
						Clear Filters
					</Button>
				</div>

				{/* Payments Table */}
				<div className="bg-card border rounded-lg overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/50">
								<TableHead>Date</TableHead>
								<TableHead>Username</TableHead>
								<TableHead className="text-right">Qty</TableHead>
								<TableHead className="text-right">Amount (SGD)</TableHead>
								<TableHead>Order ID</TableHead>
								<TableHead>Payment ID</TableHead>
								<TableHead className="text-center">Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{payments.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="h-24 text-center">
										{isLoading ? "Loading payments..." : "No payments found"}
									</TableCell>
								</TableRow>
							) : (
								payments.map((payment) => (
									<TableRow key={payment.id}>
										<TableCell className="text-muted-foreground text-sm">
											{formatDate(payment.created_at)}
										</TableCell>
										<TableCell className="font-medium">
											{payment.username}
										</TableCell>
										<TableCell className="text-right font-mono">
											{payment.quantity}
										</TableCell>
										<TableCell className="text-right font-mono text-green-500">
											S${payment.amount_sgd.toFixed(2)}
										</TableCell>
										<TableCell className="font-mono text-xs text-muted-foreground">
											{payment.razorpay_order_id ? (
												<span title={payment.razorpay_order_id}>
													{payment.razorpay_order_id.substring(0, 15)}...
												</span>
											) : (
												"-"
											)}
										</TableCell>
										<TableCell className="font-mono text-xs text-muted-foreground">
											{payment.razorpay_payment_id ? (
												<span title={payment.razorpay_payment_id}>
													{payment.razorpay_payment_id.substring(0, 15)}...
												</span>
											) : (
												"-"
											)}
										</TableCell>
										<TableCell className="text-center">
											{getStatusBadge(payment.status)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center gap-2">
						<Button
							variant="outline"
							onClick={() => setCurrentPage(1)}
							disabled={currentPage === 1}
						>
							First
						</Button>
						<Button
							variant="outline"
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
						>
							Previous
						</Button>
						<span className="flex items-center px-4">
							Page {currentPage} of {totalPages}
						</span>
						<Button
							variant="outline"
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
						>
							Next
						</Button>
						<Button
							variant="outline"
							onClick={() => setCurrentPage(totalPages)}
							disabled={currentPage === totalPages}
						>
							Last
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
