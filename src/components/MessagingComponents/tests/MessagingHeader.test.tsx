import { describe, it, expect, vi } from "vitest";
import { render, screen, configure } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MessagingHeader from "../MessagingHeader";

configure({ testIdAttribute: "data-testid" });

vi.mock("@/components/MessagingComponents/Modal", () => ({
  Modal: ({ isOpen, children, onClose }: any) =>
    isOpen ? (
      <div data-testid="modal">
        {children}
        <button onClick={onClose}>Close modal</button>
      </div>
    ) : null,
}));

vi.mock("@/pages/social/messages/ModalNewMessageBody", () => ({
  default: ({ onClose }: any) => (
    <div data-testid="new-message-body">
      <button onClick={onClose}>Close body</button>
    </div>
  ),
}));

const renderHeader = () =>
  render(
    <MemoryRouter>
      <MessagingHeader />
    </MemoryRouter>
  );

describe("MessagingHeader", () => {
  it("renders the Messages heading", () => {
    renderHeader();
    expect(
      screen.getByRole("heading", { name: /messages/i })
    ).toBeInTheDocument();
  });

  it("renders the New button", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /new/i })).toBeInTheDocument();
  });

  it("does not show modal initially", () => {
    renderHeader();
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("opens the modal when New is clicked", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /new/i }));
    expect(await screen.findByTestId("modal")).toBeInTheDocument();
  });

  it("renders ModalNewMessageBody inside the modal", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /new/i }));
    expect(await screen.findByTestId("new-message-body")).toBeInTheDocument();
  });

  it("closes the modal when onClose is called from Modal", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /new/i }));
    await userEvent.click(await screen.findByText("Close modal"));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("closes the modal when onClose is called from ModalNewMessageBody", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /new/i }));
    await userEvent.click(await screen.findByText("Close body"));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });
});