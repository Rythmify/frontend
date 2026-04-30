import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HorizontalCarousel from "./HorizontalCarousel";

// ─── Mock Browser APIs ────────────────────────────────────

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// ─── Test Suite ───────────────────────────────────────────

describe("HorizontalCarousel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Null guard ───────────────────────────────────────────

  it("renders nothing when children is empty", () => {
    const { container } = render(
      <HorizontalCarousel title="Test">{[]}</HorizontalCarousel>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  // ── Layout ───────────────────────────────────────────────

  it("renders the carousel wrapper", () => {
    render(
      <HorizontalCarousel title="My Section">
        <div>child</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByTestId("carousel-wrapper")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(
      <HorizontalCarousel title="My Section">
        <div>child</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByTestId("carousel-title")).toHaveTextContent("My Section");
  });

  it("renders children inside the scroll container", () => {
    render(
      <HorizontalCarousel title="Test">
        <div data-test="child-1">one</div>
        <div data-test="child-2">two</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  it("renders the scroll container", () => {
    render(
      <HorizontalCarousel title="Test">
        <div>child</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByTestId("carousel-scroll-container")).toBeInTheDocument();
  });

  // ── Arrow buttons ────────────────────────────────────────

  it("renders left arrow button", () => {
    render(
      <HorizontalCarousel title="Test">
        <div>child</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByTestId("button-carousel-left")).toBeInTheDocument();
  });

  it("renders right arrow button", () => {
    render(
      <HorizontalCarousel title="Test">
        <div>child</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByTestId("button-carousel-right")).toBeInTheDocument();
  });

  it("left arrow is disabled at start", () => {
    render(
      <HorizontalCarousel title="Test">
        <div>child</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByTestId("button-carousel-left")).toBeDisabled();
  });

  it("clicking left arrow does not throw", () => {
    render(
      <HorizontalCarousel title="Test">
        <div>child</div>
      </HorizontalCarousel>,
    );
    expect(() => fireEvent.click(screen.getByTestId("button-carousel-left"))).not.toThrow();
  });

  it("clicking right arrow does not throw", () => {
    render(
      <HorizontalCarousel title="Test">
        <div>child</div>
      </HorizontalCarousel>,
    );
    expect(() => fireEvent.click(screen.getByTestId("button-carousel-right"))).not.toThrow();
  });

  // ── titleClassName prop ──────────────────────────────────

  it("applies custom titleClassName when provided", () => {
    render(
      <HorizontalCarousel title="Test" titleClassName="custom-class">
        <div>child</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByTestId("carousel-title").className).toContain("custom-class");
  });

  // ── data-section prop ────────────────────────────────────

  it("forwards data-section to the wrapper", () => {
    render(
      <HorizontalCarousel title="Test" data-section="my-section">
        <div>child</div>
      </HorizontalCarousel>,
    );
    expect(screen.getByTestId("carousel-wrapper")).toHaveAttribute(
      "data-section",
      "my-section",
    );
  });
});
