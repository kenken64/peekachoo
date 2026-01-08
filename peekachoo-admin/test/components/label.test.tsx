/**
 * Tests for Label component
 */
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label Component", () => {
	describe("Rendering", () => {
		it("should render label with text", () => {
			render(<Label>Email</Label>);
			expect(screen.getByText("Email")).toBeInTheDocument();
		});

		it("should render as label element", () => {
			render(<Label>Username</Label>);
			const label = screen.getByText("Username");
			expect(label.tagName).toBe("LABEL");
		});

		it("should render children elements", () => {
			render(
				<Label>
					<span data-testid="child">Required</span> Field
				</Label>,
			);
			expect(screen.getByTestId("child")).toBeInTheDocument();
		});
	});

	describe("Styling", () => {
		it("should have base styles", () => {
			render(<Label data-testid="label">Email</Label>);
			const label = screen.getByTestId("label");
			expect(label).toHaveClass("text-sm");
			expect(label).toHaveClass("font-medium");
			expect(label).toHaveClass("leading-none");
		});

		it("should merge custom className", () => {
			render(
				<Label data-testid="label" className="custom-label">
					Email
				</Label>,
			);
			const label = screen.getByTestId("label");
			expect(label).toHaveClass("custom-label");
			expect(label).toHaveClass("text-sm");
		});

		it("should have peer-disabled styles", () => {
			render(<Label data-testid="label">Email</Label>);
			const label = screen.getByTestId("label");
			expect(label).toHaveClass("peer-disabled:cursor-not-allowed");
			expect(label).toHaveClass("peer-disabled:opacity-70");
		});
	});

	describe("Association with inputs", () => {
		it("should associate with input via htmlFor", () => {
			render(
				<>
					<Label htmlFor="email-input">Email</Label>
					<input id="email-input" type="email" />
				</>,
			);

			const label = screen.getByText("Email");
			expect(label).toHaveAttribute("for", "email-input");
		});

		it("should work with nested input", () => {
			render(
				<Label>
					Email
					<input type="email" data-testid="input" />
				</Label>,
			);

			expect(screen.getByTestId("input")).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should be accessible via label text", () => {
			render(
				<>
					<Label htmlFor="password">Password</Label>
					<input id="password" type="password" />
				</>,
			);

			expect(screen.getByLabelText("Password")).toBeInTheDocument();
		});
	});

	describe("Ref forwarding", () => {
		it("should forward ref to label element", () => {
			const ref = { current: null as HTMLLabelElement | null };
			render(<Label ref={ref}>Email</Label>);
			expect(ref.current).toBeInstanceOf(HTMLLabelElement);
		});
	});
});
