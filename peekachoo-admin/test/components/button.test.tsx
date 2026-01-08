/**
 * Tests for Button component
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, buttonVariants } from "@/components/ui/button";

describe("Button Component", () => {
	describe("Rendering", () => {
		it("should render button with text", () => {
			render(<Button>Click me</Button>);
			expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
		});

		it("should render button with children elements", () => {
			render(
				<Button>
					<span data-testid="icon">Icon</span>
					<span>Text</span>
				</Button>,
			);
			expect(screen.getByTestId("icon")).toBeInTheDocument();
		});

		it("should render as child component when asChild is true", () => {
			render(
				<Button asChild>
					<a href="/test">Link Button</a>
				</Button>,
			);
			expect(screen.getByRole("link", { name: /link button/i })).toBeInTheDocument();
		});
	});

	describe("Variants", () => {
		it("should apply default variant styles", () => {
			render(<Button>Default</Button>);
			const button = screen.getByRole("button");
			expect(button).toHaveClass("bg-primary");
		});

		it("should apply destructive variant styles", () => {
			render(<Button variant="destructive">Destructive</Button>);
			const button = screen.getByRole("button");
			expect(button).toHaveClass("bg-destructive");
		});

		it("should apply outline variant styles", () => {
			render(<Button variant="outline">Outline</Button>);
			const button = screen.getByRole("button");
			expect(button).toHaveClass("border");
		});

		it("should apply secondary variant styles", () => {
			render(<Button variant="secondary">Secondary</Button>);
			const button = screen.getByRole("button");
			expect(button).toHaveClass("bg-secondary");
		});

		it("should apply ghost variant styles", () => {
			render(<Button variant="ghost">Ghost</Button>);
			const button = screen.getByRole("button");
			expect(button).toHaveClass("hover:bg-accent");
		});

		it("should apply link variant styles", () => {
			render(<Button variant="link">Link</Button>);
			const button = screen.getByRole("button");
			expect(button).toHaveClass("underline-offset-4");
		});
	});

	describe("Sizes", () => {
		it("should apply default size styles", () => {
			render(<Button>Default Size</Button>);
			const button = screen.getByRole("button");
			expect(button).toHaveClass("h-9");
		});

		it("should apply small size styles", () => {
			render(<Button size="sm">Small</Button>);
			const button = screen.getByRole("button");
			expect(button).toHaveClass("h-8");
		});

		it("should apply large size styles", () => {
			render(<Button size="lg">Large</Button>);
			const button = screen.getByRole("button");
			expect(button).toHaveClass("h-10");
		});

		it("should apply icon size styles", () => {
			render(<Button size="icon">Icon</Button>);
			const button = screen.getByRole("button");
			expect(button).toHaveClass("w-9");
		});
	});

	describe("Interaction", () => {
		it("should call onClick when clicked", async () => {
			const user = userEvent.setup();
			const handleClick = jest.fn();
			render(<Button onClick={handleClick}>Click</Button>);

			await user.click(screen.getByRole("button"));

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it("should not call onClick when disabled", async () => {
			const user = userEvent.setup();
			const handleClick = jest.fn();
			render(
				<Button onClick={handleClick} disabled>
					Disabled
				</Button>,
			);

			await user.click(screen.getByRole("button"));

			expect(handleClick).not.toHaveBeenCalled();
		});

		it("should apply disabled styles when disabled", () => {
			render(<Button disabled>Disabled</Button>);
			const button = screen.getByRole("button");
			expect(button).toBeDisabled();
			expect(button).toHaveClass("disabled:opacity-50");
		});
	});

	describe("Custom className", () => {
		it("should merge custom className with default styles", () => {
			render(<Button className="custom-class">Custom</Button>);
			const button = screen.getByRole("button");
			expect(button).toHaveClass("custom-class");
			expect(button).toHaveClass("inline-flex");
		});
	});

	describe("buttonVariants", () => {
		it("should return correct classes for variant and size", () => {
			const classes = buttonVariants({ variant: "destructive", size: "lg" });
			expect(classes).toContain("bg-destructive");
			expect(classes).toContain("h-10");
		});
	});

	describe("Ref forwarding", () => {
		it("should forward ref to button element", () => {
			const ref = { current: null as HTMLButtonElement | null };
			render(<Button ref={ref}>Ref Button</Button>);
			expect(ref.current).toBeInstanceOf(HTMLButtonElement);
		});
	});
});
