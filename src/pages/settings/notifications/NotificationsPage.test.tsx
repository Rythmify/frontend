import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NotificationsPage from "@/pages/settings/notifications/NotificationsPage";
import axiosInstance from "@/services/api/axiosInstance";

vi.mock("@/services/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

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
  new_message_in_app: true,
  new_message_push: true,
  feature_updates_email: true,
  feature_updates_push: true,
  surveys_and_feedback_email: false,
  surveys_and_feedback_push: false,
  promotional_content_email: false,
  promotional_content_push: false,
  newsletter_email: false,
};

function getRowCheckboxes(text: string) {
  const label = screen.getByText(text);
  let current: HTMLElement | null = label.parentElement;
  let checkboxes: NodeListOf<Element> | null = null;

  while (current && !checkboxes?.length) {
    checkboxes = current.querySelectorAll('div[class*="w-5"][class*="h-5"]');
    current = current.parentElement;
  }

  if (!checkboxes || checkboxes.length === 0) {
    throw new Error(`Checkboxes not found for row: ${text}`);
  }

  return Array.from(checkboxes) as HTMLElement[];
}

describe("NotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: serverPrefs },
    });
  });

  it("loads notification preferences on mount", async () => {
    render(<NotificationsPage />);

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith("/notifications/preferences");
    });

    expect(screen.getByText("Activities")).toBeInTheDocument();
    expect(screen.getByText("Updates from Rythmify")).toBeInTheDocument();
    expect(screen.getByTestId("settings-notifications-save-button")).toBeDisabled();
  });

  it("enables save and persists changed preferences", async () => {
    (axiosInstance.patch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

    render(<NotificationsPage />);
    await screen.findByText("New follower");

    const [emailCheckbox] = getRowCheckboxes("New follower");
    fireEvent.click(emailCheckbox);

    expect(screen.getByTestId("settings-notifications-save-button")).toBeEnabled();
    fireEvent.click(screen.getByTestId("settings-notifications-save-button"));

    await waitFor(() => {
      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/notifications/preferences",
        expect.objectContaining({
          new_follower_email: true,
        }),
      );
    });

    expect(await screen.findByText("Saved!")).toBeInTheDocument();
  });

  it("reloads server state when cancel is clicked", async () => {
    render(<NotificationsPage />);
    await screen.findByText("New follower");

    const [emailCheckbox] = getRowCheckboxes("New follower");
    fireEvent.click(emailCheckbox);

    expect(screen.getByTestId("settings-notifications-save-button")).toBeEnabled();
    fireEvent.click(screen.getByTestId("settings-notifications-cancel-button"));

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByTestId("settings-notifications-save-button")).toBeDisabled();
  });
});
