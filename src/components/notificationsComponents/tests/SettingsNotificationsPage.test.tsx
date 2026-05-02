import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/services/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import SettingsNotificationsPage from "@/pages/settings/notifications/NotificationsPage";
import axiosInstance from "@/services/api/axiosInstance";

const mockAxios = axiosInstance as unknown as {
  get: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

const serverPrefs = {
  new_follower_email: false,
  new_follower_push: true,
  repost_of_your_post_email: false,
  repost_of_your_post_push: true,
  new_post_by_followed_email: false,
  new_post_by_followed_push: false,
  likes_and_plays_email: false,
  likes_and_plays_push: false,
  comment_on_post_email: false,
  comment_on_post_push: true,
  recommended_content_email: false,
  recommended_content_push: false,
  new_message_email: false,
  new_message_push: true,
  messages_from: "everyone",
  feature_updates_email: true,
  feature_updates_push: true,
  surveys_and_feedback_email: false,
  surveys_and_feedback_push: false,
  promotional_content_email: false,
  promotional_content_push: false,
  newsletter_email: false,
};

function row(label: string) {
  const labelEl = screen.getByText(label);
  let current = labelEl.parentElement;
  while (current && current.querySelectorAll('div[class*="w-5"][class*="h-5"]').length === 0) {
    current = current.parentElement;
  }
  if (!current) throw new Error(`Row not found for ${label}`);
  return current as HTMLElement;
}

function rowCheckboxes(label: string) {
  return Array.from(row(label).querySelectorAll('div[class*="w-5"][class*="h-5"]')) as HTMLElement[];
}

function sectionHeader(title: string) {
  return screen.getByText(title).closest(".flex.items-center") as HTMLElement;
}

function sectionCheckboxes(title: string) {
  return Array.from(sectionHeader(title).querySelectorAll('div[class*="w-5"][class*="h-5"]')) as HTMLElement[];
}

describe("settings NotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: { data: serverPrefs } });
    mockAxios.patch.mockResolvedValue({});
  });

  it("loads preferences and renders sections, rows, dropdowns, and disabled save", async () => {
    render(<SettingsNotificationsPage />);

    await waitFor(() => expect(mockAxios.get).toHaveBeenCalledWith("/notifications/preferences"));

    expect(screen.getByText("Activities")).toBeInTheDocument();
    expect(screen.getByText("Updates from Rythmify")).toBeInTheDocument();
    expect(screen.getByText("New message")).toBeInTheDocument();
    expect(screen.getByTestId("settings-notifications-new_message_email-dropdown")).toHaveValue("everyone");
    expect(screen.getByTestId("settings-notifications-save-button")).toBeDisabled();
  });

  it("falls back to defaults when loading preferences fails", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("load failed"));
    render(<SettingsNotificationsPage />);

    await waitFor(() => expect(mockAxios.get).toHaveBeenCalled());

    expect(screen.getByText("New follower")).toBeInTheDocument();
    expect(screen.getByTestId("settings-notifications-save-button")).toBeDisabled();
  });

  it("toggles a row preference and saves successfully", async () => {
    render(<SettingsNotificationsPage />);
    await screen.findByText("New follower");

    fireEvent.click(rowCheckboxes("New follower")[0]);
    expect(screen.getByTestId("settings-notifications-save-button")).toBeEnabled();

    fireEvent.click(screen.getByTestId("settings-notifications-save-button"));

    await waitFor(() =>
      expect(mockAxios.patch).toHaveBeenCalledWith(
        "/notifications/preferences",
        expect.objectContaining({ new_follower_email: true }),
      ),
    );
    expect(await screen.findByText("Saved!")).toBeInTheDocument();
    expect(screen.getByTestId("settings-notifications-save-button")).toBeDisabled();
  });

  it("shows a spinner while saving and an error when save fails", async () => {
    let reject!: (error: Error) => void;
    mockAxios.patch.mockReturnValueOnce(new Promise((_, rej) => { reject = rej; }));
    render(<SettingsNotificationsPage />);
    await screen.findByText("Comment on your post");

    fireEvent.click(rowCheckboxes("Comment on your post")[0]);
    fireEvent.click(screen.getByTestId("settings-notifications-save-button"));
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();

    reject(new Error("save failed"));
    expect(await screen.findByText("Failed to save")).toBeInTheDocument();
    expect(screen.getByTestId("settings-notifications-save-button")).toBeEnabled();
  });

  it("toggles all email and device values from section headers", async () => {
    render(<SettingsNotificationsPage />);
    await screen.findByText("Activities");

    const [emailAll, deviceAll] = sectionCheckboxes("Activities");
    fireEvent.click(emailAll);
    fireEvent.click(deviceAll);
    fireEvent.click(screen.getByTestId("settings-notifications-save-button"));

    await waitFor(() =>
      expect(mockAxios.patch).toHaveBeenCalledWith(
        "/notifications/preferences",
        expect.objectContaining({
          new_follower_email: true,
          repost_of_your_post_email: true,
          recommended_content_email: true,
          new_follower_push: true,
          new_message_push: true,
        }),
      ),
    );
  });

  it("updates message dropdowns and checkbox+dropdown rows", async () => {
    const user = userEvent.setup();
    render(<SettingsNotificationsPage />);
    await screen.findByText("New message");

    fireEvent.click(rowCheckboxes("New message")[0]);
    await user.selectOptions(screen.getByTestId("settings-notifications-new_message_email-dropdown"), "followers_only");
    fireEvent.click(screen.getByTestId("settings-notifications-save-button"));

    await waitFor(() =>
      expect(mockAxios.patch).toHaveBeenCalledWith(
        "/notifications/preferences",
        expect.objectContaining({
          new_message_email: true,
          messages_from: "followers_only",
        }),
      ),
    );
  });

  it("cancels local changes by reloading from the server", async () => {
    render(<SettingsNotificationsPage />);
    await screen.findByText("New follower");

    fireEvent.click(rowCheckboxes("New follower")[0]);
    expect(screen.getByTestId("settings-notifications-save-button")).toBeEnabled();

    fireEvent.click(screen.getByTestId("settings-notifications-cancel-button"));

    await waitFor(() => expect(mockAxios.get).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId("settings-notifications-save-button")).toBeDisabled();
  });
});
