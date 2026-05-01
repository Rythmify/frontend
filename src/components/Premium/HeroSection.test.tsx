import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HeroSection from "./HeroSection";

describe("HeroSection", () => {
  it("renders the hero copy, CTA, and plan link", () => {
    render(
      <HeroSection
        onGetStarted={vi.fn()}
        isStarting={false}
        disabled={false}
      />,
    );

    expect(screen.getByRole("heading", { name: "Reach more listeners." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get Premium" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See plan" })).toHaveAttribute(
      "href",
      "#pricing-cards",
    );
    expect(screen.getByText("Grow your audience")).toBeInTheDocument();
    expect(screen.getByText("Know your audience")).toBeInTheDocument();
    expect(screen.getByText("Upload unlimited tracks")).toBeInTheDocument();
    expect(screen.getByText("Distribution is included")).toBeInTheDocument();
  });

  it("shows the loading label when the CTA is starting", () => {
    render(
      <HeroSection onGetStarted={vi.fn()} isStarting disabled={false} />,
    );

    expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
  });
});
