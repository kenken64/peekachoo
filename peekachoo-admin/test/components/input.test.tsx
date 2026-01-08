/**
 * Tests for Input component
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input Component", () => {
	describe("Rendering", () => {
		it("should render input element", () => {
			render(<Input />);
			expect(screen.getByRole("textbox")).toBeInTheDocument();
		});

		it("should render with placeholder", () => {
			render(<Input placeholder="Enter text" />);
			expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
		});

		it("should render with different types", () => {
			const { rerender } = render(<Input type="email" />);
			expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

			rerender(<Input type="password" />);
			expect(screen.getByDisplayValue("")).toHaveAttribute("type", "password");
		});

		it("should render with default value", () => {
			render(<Input defaultValue="initial" />);
			expect(screen.getByRole("textbox")).toHaveValue("initial");
		});
	});

	describe("Styling", () => {
		it("should have base styles", () => {
			render(<Input />);
			const input = screen.getByRole("textbox");
			expect(input).toHaveClass("flex");
			expect(input).toHaveClass("h-9");
			expect(input).toHaveClass("w-full");
			expect(input).toHaveClass("rounded-md");
		});

		it("should merge custom className", () => {
			render(<Input className="custom-input" />);
			const input = screen.getByRole("textbox");
			expect(input).toHaveClass("custom-input");
			expect(input).toHaveClass("flex");
		});
	});

	describe("Interaction", () => {
		it("should handle text input", async () => {
			const user = userEvent.setup();
			render(<Input />);
			const input = screen.getByRole("textbox");

			await user.type(input, "Hello World");

			expect(input).toHaveValue("Hello World");
		});

		it("should call onChange when value changes", async () => {
			const user = userEvent.setup();
			const handleChange = jest.fn();
			render(<Input onChange={handleChange} />);

			await user.type(screen.getByRole("textbox"), "a");

			expect(handleChange).toHaveBeenCalled();
		});

		it("should call onFocus when focused", async () => {
			const user = userEvent.setup();
			const handleFocus = jest.fn();
			render(<Input onFocus={handleFocus} />);

			await user.click(screen.getByRole("textbox"));

			expect(handleFocus).toHaveBeenCalled();
		});

		it("should call onBlur when blurred", async () => {
			const user = userEvent.setup();
			const handleBlur = jest.fn();
			render(<Input onBlur={handleBlur} />);
			const input = screen.getByRole("textbox");

			await user.click(input);
			await user.tab();

			expect(handleBlur).toHaveBeenCalled();
		});
	});

	describe("Disabled state", () => {
		it("should be disabled when disabled prop is true", () => {
			render(<Input disabled />);
			expect(screen.getByRole("textbox")).toBeDisabled();
		});

		it("should have disabled styles", () => {
			render(<Input disabled />);
			const input = screen.getByRole("textbox");
			expect(input).toHaveClass("disabled:cursor-not-allowed");
			expect(input).toHaveClass("disabled:opacity-50");
		});

		it("should not accept input when disabled", async () => {
			const user = userEvent.setup();
			render(<Input disabled defaultValue="initial" />);
			const input = screen.getByRole("textbox");

			await user.type(input, "new text");

			expect(input).toHaveValue("initial");
		});
	});

	describe("Controlled input", () => {
		it("should work as controlled input", async () => {
			const TestComponent = () => {
				const [value, setValue] = React.useState("");
				return (
					<Input
						value={value}
						onChange={(e) => setValue(e.target.value.toUpperCase())}
					/>
				);
			};

			const React = await import("react");
			const { render: renderComponent } = await import(
				"@testing-library/react"
			);
			const user = userEvent.setup();

			renderComponent(<TestComponent />);
			const input = screen.getByRole("textbox");

			await user.type(input, "hello");

			expect(input).toHaveValue("HELLO");
		});
	});

	describe("Ref forwarding", () => {
		it("should forward ref to input element", () => {
			const ref = { current: null as HTMLInputElement | null };
			render(<Input ref={ref} />);
			expect(ref.current).toBeInstanceOf(HTMLInputElement);
		});

		it("should allow programmatic focus via ref", () => {
			const ref = { current: null as HTMLInputElement | null };
			render(<Input ref={ref} />);

			ref.current?.focus();

			expect(document.activeElement).toBe(ref.current);
		});
	});

	describe("Accessibility", () => {
		it("should support aria-label", () => {
			render(<Input aria-label="Username input" />);
			expect(screen.getByLabelText("Username input")).toBeInTheDocument();
		});

		it("should support aria-describedby", () => {
			render(
				<>
					<Input aria-describedby="hint" />
					<span id="hint">Enter your username</span>
				</>,
			);
			expect(screen.getByRole("textbox")).toHaveAttribute(
				"aria-describedby",
				"hint",
			);
		});
	});
});
