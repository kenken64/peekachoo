/**
 * Tests for Table components
 */
import { render, screen } from "@testing-library/react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

describe("Table Components", () => {
	describe("Table", () => {
		it("should render table element", () => {
			render(
				<Table>
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			expect(screen.getByRole("table")).toBeInTheDocument();
		});

		it("should be wrapped in overflow container", () => {
			const { container } = render(
				<Table data-testid="table">
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			const wrapper = container.firstChild as HTMLElement;
			expect(wrapper).toHaveClass("relative");
			expect(wrapper).toHaveClass("w-full");
			expect(wrapper).toHaveClass("overflow-auto");
		});

		it("should have base table styles", () => {
			render(
				<Table data-testid="table">
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			const table = screen.getByRole("table");
			expect(table).toHaveClass("w-full");
			expect(table).toHaveClass("caption-bottom");
			expect(table).toHaveClass("text-sm");
		});

		it("should merge custom className", () => {
			render(
				<Table className="custom-table">
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			const table = screen.getByRole("table");
			expect(table).toHaveClass("custom-table");
		});
	});

	describe("TableHeader", () => {
		it("should render thead element", () => {
			render(
				<Table>
					<TableHeader data-testid="header">
						<TableRow>
							<TableHead>Header</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			expect(screen.getByTestId("header").tagName).toBe("THEAD");
		});

		it("should have border-b style on rows", () => {
			render(
				<Table>
					<TableHeader data-testid="header">
						<TableRow>
							<TableHead>Header</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			expect(screen.getByTestId("header")).toHaveClass("[&_tr]:border-b");
		});
	});

	describe("TableBody", () => {
		it("should render tbody element", () => {
			render(
				<Table>
					<TableBody data-testid="body">
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			expect(screen.getByTestId("body").tagName).toBe("TBODY");
		});

		it("should remove border from last row", () => {
			render(
				<Table>
					<TableBody data-testid="body">
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			expect(screen.getByTestId("body")).toHaveClass(
				"[&_tr:last-child]:border-0",
			);
		});
	});

	describe("TableFooter", () => {
		it("should render tfoot element", () => {
			render(
				<Table>
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
					<TableFooter data-testid="footer">
						<TableRow>
							<TableCell>Footer</TableCell>
						</TableRow>
					</TableFooter>
				</Table>,
			);
			expect(screen.getByTestId("footer").tagName).toBe("TFOOT");
		});

		it("should have correct styles", () => {
			render(
				<Table>
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
					<TableFooter data-testid="footer">
						<TableRow>
							<TableCell>Footer</TableCell>
						</TableRow>
					</TableFooter>
				</Table>,
			);
			const footer = screen.getByTestId("footer");
			expect(footer).toHaveClass("border-t");
			expect(footer).toHaveClass("bg-muted/50");
			expect(footer).toHaveClass("font-medium");
		});
	});

	describe("TableRow", () => {
		it("should render tr element", () => {
			render(
				<Table>
					<TableBody>
						<TableRow data-testid="row">
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			expect(screen.getByTestId("row").tagName).toBe("TR");
		});

		it("should have hover and border styles", () => {
			render(
				<Table>
					<TableBody>
						<TableRow data-testid="row">
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			const row = screen.getByTestId("row");
			expect(row).toHaveClass("border-b");
			expect(row).toHaveClass("transition-colors");
			expect(row).toHaveClass("hover:bg-muted/50");
		});

		it("should support data-state for selection", () => {
			render(
				<Table>
					<TableBody>
						<TableRow data-testid="row" data-state="selected">
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			const row = screen.getByTestId("row");
			expect(row).toHaveClass("data-[state=selected]:bg-muted");
		});
	});

	describe("TableHead", () => {
		it("should render th element", () => {
			render(
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead data-testid="head">Header</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			expect(screen.getByTestId("head").tagName).toBe("TH");
		});

		it("should have correct styles", () => {
			render(
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead data-testid="head">Header</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			const head = screen.getByTestId("head");
			expect(head).toHaveClass("h-10");
			expect(head).toHaveClass("px-2");
			expect(head).toHaveClass("text-left");
			expect(head).toHaveClass("font-medium");
			expect(head).toHaveClass("text-muted-foreground");
		});
	});

	describe("TableCell", () => {
		it("should render td element", () => {
			render(
				<Table>
					<TableBody>
						<TableRow>
							<TableCell data-testid="cell">Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			expect(screen.getByTestId("cell").tagName).toBe("TD");
		});

		it("should have correct styles", () => {
			render(
				<Table>
					<TableBody>
						<TableRow>
							<TableCell data-testid="cell">Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			const cell = screen.getByTestId("cell");
			expect(cell).toHaveClass("p-2");
			expect(cell).toHaveClass("align-middle");
		});
	});

	describe("TableCaption", () => {
		it("should render caption element", () => {
			render(
				<Table>
					<TableCaption data-testid="caption">Table Caption</TableCaption>
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			expect(screen.getByTestId("caption").tagName).toBe("CAPTION");
		});

		it("should have correct styles", () => {
			render(
				<Table>
					<TableCaption data-testid="caption">Table Caption</TableCaption>
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			const caption = screen.getByTestId("caption");
			expect(caption).toHaveClass("mt-4");
			expect(caption).toHaveClass("text-sm");
			expect(caption).toHaveClass("text-muted-foreground");
		});
	});

	describe("Complete Table", () => {
		it("should render complete table with all components", () => {
			render(
				<Table>
					<TableCaption>User List</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>John</TableCell>
							<TableCell>john@example.com</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Jane</TableCell>
							<TableCell>jane@example.com</TableCell>
						</TableRow>
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell colSpan={2}>Total: 2 users</TableCell>
						</TableRow>
					</TableFooter>
				</Table>,
			);

			expect(screen.getByText("User List")).toBeInTheDocument();
			expect(screen.getByText("Name")).toBeInTheDocument();
			expect(screen.getByText("Email")).toBeInTheDocument();
			expect(screen.getByText("John")).toBeInTheDocument();
			expect(screen.getByText("john@example.com")).toBeInTheDocument();
			expect(screen.getByText("Jane")).toBeInTheDocument();
			expect(screen.getByText("jane@example.com")).toBeInTheDocument();
			expect(screen.getByText("Total: 2 users")).toBeInTheDocument();
		});

		it("should have correct role structure", () => {
			render(
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Header</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);

			expect(screen.getByRole("table")).toBeInTheDocument();
			// There are 2 rowgroups: thead and tbody
			expect(screen.getAllByRole("rowgroup")).toHaveLength(2);
			expect(screen.getAllByRole("row")).toHaveLength(2);
			expect(screen.getByRole("columnheader")).toBeInTheDocument();
			expect(screen.getByRole("cell")).toBeInTheDocument();
		});
	});

	describe("Ref forwarding", () => {
		it("should forward ref to table element", () => {
			const ref = { current: null as HTMLTableElement | null };
			render(
				<Table ref={ref}>
					<TableBody>
						<TableRow>
							<TableCell>Cell</TableCell>
						</TableRow>
					</TableBody>
				</Table>,
			);
			expect(ref.current).toBeInstanceOf(HTMLTableElement);
		});
	});
});
