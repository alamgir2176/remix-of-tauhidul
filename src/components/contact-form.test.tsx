import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "./contact-form";

const submit = vi.hoisted(() => vi.fn());
vi.mock("@/lib/contact.functions", () => ({ submitContact: submit }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Contact form recovery", () => {
  it("focuses the first invalid field and preserves entered values", async () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "invalid" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(screen.getByLabelText("Name")).toHaveFocus());
    expect(screen.getByLabelText("Email")).toHaveValue("invalid");
    expect(submit).not.toHaveBeenCalled();
  });

  it("allows retry after delivery failure without losing the message", async () => {
    submit.mockRejectedValueOnce(new Error("Delivery unavailable"));
    submit.mockResolvedValueOnce({ ok: true });
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Review visitor" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "visitor@example.org" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "A thoughtful test message." } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByText("Delivery unavailable");
    expect(screen.getByLabelText("Message")).toHaveValue("A thoughtful test message.");
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByText("Your message has been received.");
    expect(submit).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(document.activeElement).toHaveClass("contact-success"));
  });
});