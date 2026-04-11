import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ContentPage from "@/pages/settings/content/ContentPage";
import {
  getContentSettings,
  updateContentSettings,
} from "@/services/settings.service";

vi.mock("@/services/settings.service", () => ({
  getContentSettings: vi.fn(),
  updateContentSettings: vi.fn(),
}));

const initialSettings = {
  rss_title: "My feed",
  rss_language: "English",
  rss_category: "Music",
  rss_explicit: false,
  rss_show_email: false,
  default_include_in_rss: true,
  default_license_type: "all_rights_reserved" as const,
};

function getCheckboxContainerByText(text: string) {
  const label = screen.getByText(text).closest("label");
  const checkbox = label?.querySelector('div[class*="w-5"][class*="h-5"]');

  if (!checkbox) {
    throw new Error(`Checkbox not found for label: ${text}`);
  }

  return checkbox as HTMLElement;
}

describe("ContentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getContentSettings as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      initialSettings,
    );
  });

  it("loads saved content settings into the form", async () => {
    render(<ContentPage />);

    await waitFor(() => {
      expect(getContentSettings).toHaveBeenCalled();
    });

    expect(screen.getByTestId("settings-content-rss-title-input")).toHaveValue(
      "My feed",
    );
    expect(screen.getByTestId("settings-content-rss-category-select")).toHaveValue(
      "Music",
    );
    expect(screen.getByTestId("settings-content-rss-language-select")).toHaveValue(
      "English",
    );
  });

  it("saves edited content settings", async () => {
    const savedSettings = {
      ...initialSettings,
      rss_title: "Updated feed",
      rss_language: "Arabic",
    };

    (updateContentSettings as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      savedSettings,
    );

    render(<ContentPage />);
    const titleInput = (await screen.findByTestId(
      "settings-content-rss-title-input",
    )) as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: "Updated feed" } });
    fireEvent.change(screen.getByTestId("settings-content-rss-language-select"), {
      target: { value: "Arabic" },
    });
    fireEvent.click(screen.getByTestId("settings-content-save-button"));

    await waitFor(() => {
      expect(updateContentSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          rss_title: "Updated feed",
          rss_language: "Arabic",
        }),
      );
    });

    expect(screen.getByTestId("settings-content-rss-title-input")).toHaveValue(
      "Updated feed",
    );
  });

  it("restores the last saved values when cancel is clicked", async () => {
    render(<ContentPage />);
    const titleInput = (await screen.findByTestId(
      "settings-content-rss-title-input",
    )) as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: "Unsaved title" } });
    fireEvent.change(screen.getByTestId("settings-content-rss-language-select"), {
      target: { value: "French" },
    });
    fireEvent.click(screen.getByTestId("settings-content-cancel-button"));

    expect(screen.getByTestId("settings-content-rss-title-input")).toHaveValue(
      "My feed",
    );
    expect(screen.getByTestId("settings-content-rss-language-select")).toHaveValue(
      "English",
    );
  });

  it("shows the creative commons section when its checkbox is enabled", async () => {
    render(<ContentPage />);
    await screen.findByText("Creative Commons license");

    expect(screen.queryByText("Some rights reserved")).not.toBeInTheDocument();
    fireEvent.click(getCheckboxContainerByText("Creative Commons license"));

    expect(await screen.findByText("Some rights reserved")).toBeInTheDocument();
  });
});
