import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SoundsPageAuth from "@/pages/search/sounds/SoundsPageAuth";
import SoundsPageGuest from "@/pages/search/sounds/SoundsPageGuest";

describe("sounds placeholder pages", () => {
  it("renders the authenticated sounds placeholder", () => {
    render(<SoundsPageAuth />);
    expect(screen.getByText("SoundsPageAuth helloooo")).toBeInTheDocument();
  });

  it("renders the guest sounds placeholder", () => {
    render(<SoundsPageGuest />);
    expect(screen.getByText("SoundsPageGuest")).toBeInTheDocument();
  });
});
