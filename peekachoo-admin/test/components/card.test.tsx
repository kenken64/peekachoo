/**
 * Tests for Card components
 */
import { render, screen } from "@testing-library/react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

describe("Card Components", () => {
	describe("Card", () => {
		it("should render card with children", () => {
			render(<Card>Card Content</Card>);
			expect(screen.getByText("Card Content")).toBeInTheDocument();
		});

		it("should have base styles", () => {
			render(<Card data-testid="card">Content</Card>);
			const card = screen.getByTestId("card");
			expect(card).toHaveClass("rounded-xl");
			expect(card).toHaveClass("border");
			expect(card).toHaveClass("bg-card");
			expect(card).toHaveClass("shadow");
		});

		it("should merge custom className", () => {
			render(
				<Card data-testid="card" className="custom-card">
					Content
				</Card>,
			);
			const card = screen.getByTestId("card");
			expect(card).toHaveClass("custom-card");
			expect(card).toHaveClass("rounded-xl");
		});

		it("should forward ref", () => {
			const ref = { current: null as HTMLDivElement | null };
			render(<Card ref={ref}>Content</Card>);
			expect(ref.current).toBeInstanceOf(HTMLDivElement);
		});
	});

	describe("CardHeader", () => {
		it("should render header content", () => {
			render(<CardHeader>Header</CardHeader>);
			expect(screen.getByText("Header")).toBeInTheDocument();
		});

		it("should have correct styles", () => {
			render(<CardHeader data-testid="header">Header</CardHeader>);
			const header = screen.getByTestId("header");
			expect(header).toHaveClass("flex");
			expect(header).toHaveClass("flex-col");
			expect(header).toHaveClass("space-y-1.5");
			expect(header).toHaveClass("p-6");
		});

		it("should merge custom className", () => {
			render(
				<CardHeader data-testid="header" className="custom-header">
					Header
				</CardHeader>,
			);
			const header = screen.getByTestId("header");
			expect(header).toHaveClass("custom-header");
		});
	});

	describe("CardTitle", () => {
		it("should render title content", () => {
			render(<CardTitle>Title</CardTitle>);
			expect(screen.getByText("Title")).toBeInTheDocument();
		});

		it("should have correct styles", () => {
			render(<CardTitle data-testid="title">Title</CardTitle>);
			const title = screen.getByTestId("title");
			expect(title).toHaveClass("font-semibold");
			expect(title).toHaveClass("leading-none");
			expect(title).toHaveClass("tracking-tight");
		});
	});

	describe("CardDescription", () => {
		it("should render description content", () => {
			render(<CardDescription>Description</CardDescription>);
			expect(screen.getByText("Description")).toBeInTheDocument();
		});

		it("should have correct styles", () => {
			render(
				<CardDescription data-testid="description">
					Description
				</CardDescription>,
			);
			const description = screen.getByTestId("description");
			expect(description).toHaveClass("text-sm");
			expect(description).toHaveClass("text-muted-foreground");
		});
	});

	describe("CardContent", () => {
		it("should render content", () => {
			render(<CardContent>Content</CardContent>);
			expect(screen.getByText("Content")).toBeInTheDocument();
		});

		it("should have correct styles", () => {
			render(<CardContent data-testid="content">Content</CardContent>);
			const content = screen.getByTestId("content");
			expect(content).toHaveClass("p-6");
			expect(content).toHaveClass("pt-0");
		});
	});

	describe("CardFooter", () => {
		it("should render footer content", () => {
			render(<CardFooter>Footer</CardFooter>);
			expect(screen.getByText("Footer")).toBeInTheDocument();
		});

		it("should have correct styles", () => {
			render(<CardFooter data-testid="footer">Footer</CardFooter>);
			const footer = screen.getByTestId("footer");
			expect(footer).toHaveClass("flex");
			expect(footer).toHaveClass("items-center");
			expect(footer).toHaveClass("p-6");
			expect(footer).toHaveClass("pt-0");
		});
	});

	describe("Complete Card", () => {
		it("should render complete card with all sub-components", () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Card Title</CardTitle>
						<CardDescription>Card Description</CardDescription>
					</CardHeader>
					<CardContent>
						<p>Card Content</p>
					</CardContent>
					<CardFooter>
						<button type="button">Action</button>
					</CardFooter>
				</Card>,
			);

			expect(screen.getByText("Card Title")).toBeInTheDocument();
			expect(screen.getByText("Card Description")).toBeInTheDocument();
			expect(screen.getByText("Card Content")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: "Action" }),
			).toBeInTheDocument();
		});

		it("should maintain proper structure", () => {
			render(
				<Card data-testid="card">
					<CardHeader data-testid="header">
						<CardTitle>Title</CardTitle>
					</CardHeader>
					<CardContent data-testid="content">Content</CardContent>
				</Card>,
			);

			const card = screen.getByTestId("card");
			const header = screen.getByTestId("header");
			const content = screen.getByTestId("content");

			expect(card).toContainElement(header);
			expect(card).toContainElement(content);
		});
	});
});
