import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PrivacyPage from "@/pages/settings/privacy/PrivacyPage";
import {
  getPrivacySettings,
  updatePrivacySettings,
} from "@/services/settings.service";

vi.mock("@/services/settings.service", () => ({
  getPrivacySettings: vi.fn(),
  updatePrivacySettings: vi.fn(),
}));

const baseSettings = {
  is_private: false,
  receive_messages_from_anyone: true,
  show_activities_in_discovery: true,
  show_as_top_fan: true,
  show_top_fans_on_tracks: true,
};

function getToggleForText(text: string) {
  const label = screen.getByText(text);
  const row = label.closest("div.flex.items-start.justify-between.gap-8");
  const toggle = row?.querySelector('div[class*="rounded-full"]');

  if (!toggle) {
    throw new Error(`Toggle not found for row: ${text}`);
  }

  return toggle as HTMLElement;
}

describe("PrivacyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getPrivacySettings as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      baseSettings,
    );
  });

  it("loads privacy settings on mount", async () => {
    render(<PrivacyPage />);

    await waitFor(() => {
      expect(getPrivacySettings).toHaveBeenCalled();
    });

    expect(screen.getByText("Privacy settings")).toBeInTheDocument();
    expect(screen.getByText("Blocked users")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /open cookie manager/i }),
    ).toBeInTheDocument();
  });

  it("updates a setting optimistically and sends the correct patch", async () => {
    (updatePrivacySettings as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...baseSettings,
      receive_messages_from_anyone: false,
    });

    render(<PrivacyPage />);
    await screen.findByText("Receive messages from anyone");

    fireEvent.click(getToggleForText("Receive messages from anyone"));

    await waitFor(() => {
      expect(updatePrivacySettings).toHaveBeenCalledWith({
        receive_messages_from_anyone: false,
      });
    });
  });

  it("reverts the toggle when the update request fails", async () => {
    (updatePrivacySettings as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("failed"),
    );

    render(<PrivacyPage />);
    await screen.findByText("Show when I'm a First or Top Fan");

    const toggle = getToggleForText("Show when I'm a First or Top Fan");

    expect(toggle.className).toContain("bg-[var(--color-accent)]");
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(updatePrivacySettings).toHaveBeenCalledWith({
        show_as_top_fan: false,
      });
    });

    await waitFor(() => {
      expect(toggle.className).toContain("bg-[var(--color-accent)]");
    });
  });
});
