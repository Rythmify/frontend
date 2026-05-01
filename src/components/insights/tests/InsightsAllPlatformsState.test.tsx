import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { InsightsAllPlatformsState } from "../InsightsAllPlatformsState";

describe("InsightsAllPlatformsState", () => {
  it("renders the all-platforms container", () => {
    render(<InsightsAllPlatformsState />);
    expect(screen.getByTestId("insights-all-platforms-state")).toBeInTheDocument();
  });

  it("renders the headline about multiple platforms", () => {
    render(<InsightsAllPlatformsState />);
    expect(
      screen.getByText(/Unlock key performance and audience insights/i),
    ).toBeInTheDocument();
  });

  it("mentions Spotify, Apple Music, and Rythmify", () => {
    render(<InsightsAllPlatformsState />);
    expect(screen.getByText(/Spotify/i)).toBeInTheDocument();
    expect(screen.getByText(/Apple Music/i)).toBeInTheDocument();
    expect(screen.getByText(/Rythmify/i)).toBeInTheDocument();
  });

  it("renders the upgrade instruction text", () => {
    render(<InsightsAllPlatformsState />);
    expect(
      screen.getByText(/Upgrade your account, upload and distribute/i),
    ).toBeInTheDocument();
  });

  it("renders the Upgrade to Artist Pro link pointing to /premium", () => {
    render(<InsightsAllPlatformsState />);
    const upgradeBtn = screen.getByTestId("insights-all-platforms-upgrade-btn");
    expect(upgradeBtn).toBeInTheDocument();
    expect(upgradeBtn).toHaveAttribute("href", "/premium");
    expect(upgradeBtn).toHaveTextContent("Upgrade to Artist Pro");
  });
});
