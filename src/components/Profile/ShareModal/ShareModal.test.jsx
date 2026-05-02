import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";

const mockOnClose = vi.fn();
const testUrl = "https://rythmify.com/travis-scott";

describe("ShareModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    expect(screen.getByTestId("share-modal-content")).toBeInTheDocument();
  });

  it("renders Share and Message tabs", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    expect(screen.getByTestId("share-tab-share")).toBeInTheDocument();
    expect(screen.getByTestId("share-tab-message")).toBeInTheDocument();
  });

  it("shows Share tab as active by default", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    expect(screen.getByTestId("share-tab-share")).toHaveClass(
      "text-bg-inverted",
    );
    expect(screen.getByTestId("share-tab-share")).toHaveClass(
      "border-bg-inverted",
    );
  });

  it("switches to Message tab on click", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId("share-tab-message"));
    expect(screen.getByTestId("share-tab-message")).toHaveClass(
      "text-bg-inverted",
    );
    expect(screen.getByTestId("share-tab-message")).toHaveClass(
      "border-bg-inverted",
    );
  });

  it("shows message form when Message tab is active", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId("share-tab-message"));
    expect(screen.getByTestId("message-recipient-input")).toBeInTheDocument();
    expect(screen.getByTestId("message-body-input")).toBeInTheDocument();
    expect(screen.getByTestId("message-send-button")).toBeInTheDocument();
  });

  it("renders all social share links", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    expect(screen.getByTestId("share-social-twitter")).toBeInTheDocument();
    expect(screen.getByTestId("share-social-facebook")).toBeInTheDocument();
    expect(screen.getByTestId("share-social-tumblr")).toBeInTheDocument();
    expect(screen.getByTestId("share-social-pinterest")).toBeInTheDocument();
    expect(screen.getByTestId("share-social-email")).toBeInTheDocument();
  });

  it("social links have correct href", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    const twitter = screen.getByTestId("share-social-twitter");
    expect(twitter).toHaveAttribute(
      "href",
      `https://twitter.com/intent/tweet?url=${testUrl}`
    );
  });

  it("displays the url", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    expect(screen.getByTestId("share-url-display")).toHaveTextContent(testUrl);
  });

  it("shortens url when shorten checkbox is checked", () => {
    const urlWithQuery = "https://rythmify.com/travis-scott?ref=sidebar";
    render(<ShareModal url={urlWithQuery} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId("share-shorten-checkbox"));
    expect(screen.getByTestId("share-url-display")).toHaveTextContent(
      "https://rythmify.com/travis-scott"
    );
  });

  it("restores full url when shorten checkbox is unchecked", () => {
    const urlWithQuery = "https://rythmify.com/travis-scott?ref=sidebar";
    render(<ShareModal url={urlWithQuery} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId("share-shorten-checkbox"));
    fireEvent.click(screen.getByTestId("share-shorten-checkbox"));
    expect(screen.getByTestId("share-url-display")).toHaveTextContent(urlWithQuery);
  });

  it("calls onClose when overlay is clicked", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId("share-modal-overlay"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    expect(screen.getByTestId("share-modal-close")).toHaveClass("top-14");
    expect(screen.getByTestId("share-modal-close")).toHaveClass("right-4");
    expect(screen.getByTestId("share-modal-close")).toHaveClass(
      "bg-bg-actionbutton",
    );
    expect(screen.getByTestId("share-modal-close")).toHaveClass(
      "text-text-secondary",
    );
    fireEvent.click(screen.getByTestId("share-modal-close"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("does not call onClose when modal content is clicked", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId("share-modal-content"));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("message body textarea has url as default value", () => {
    render(<ShareModal url={testUrl} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId("share-tab-message"));
    expect(screen.getByTestId("message-body-input")).toHaveValue(
      `Check this out:\n${testUrl}`,
    );
  });
});
