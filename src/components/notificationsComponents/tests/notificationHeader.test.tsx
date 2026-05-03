import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationHeader, { type FilterType } from "@/components/notificationsComponents/notificationHeader";

describe("NotificationHeader", () => {
  const onTypeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title and selected filter label", () => {
    render(<NotificationHeader selectedType="all" onTypeChange={onTypeChange} />);

    expect(screen.getByTestId("notification-header")).toBeInTheDocument();
    expect(screen.getByTestId("notification-header-title")).toHaveTextContent("Notifications");
    expect(screen.getByTestId("notification-filter-btn")).toHaveTextContent("All notifications");
    expect(screen.queryByTestId("notification-filter-menu")).not.toBeInTheDocument();
  });

  it.each([
    ["like", "Likes"],
    ["comment", "Comments"],
    ["repost", "Reposts"],
    ["follow", "Follows"],
  ] as Array<[FilterType, string]>)("shows the %s selected label", (selectedType, label) => {
    render(<NotificationHeader selectedType={selectedType} onTypeChange={onTypeChange} />);
    expect(screen.getByTestId("notification-filter-btn")).toHaveTextContent(label);
  });

  it("opens and closes the dropdown from the filter button", async () => {
    const user = userEvent.setup();
    render(<NotificationHeader selectedType="all" onTypeChange={onTypeChange} />);

    await user.click(screen.getByTestId("notification-filter-btn"));
    expect(screen.getByTestId("notification-filter-menu")).toBeInTheDocument();

    await user.click(screen.getByTestId("notification-filter-btn"));
    expect(screen.queryByTestId("notification-filter-menu")).not.toBeInTheDocument();
  });

  it("calls onTypeChange and closes the menu when an option is selected", async () => {
    const user = userEvent.setup();
    render(<NotificationHeader selectedType="all" onTypeChange={onTypeChange} />);

    await user.click(screen.getByTestId("notification-filter-btn"));
    await user.click(screen.getByTestId("notification-filter-option-comment"));

    expect(onTypeChange).toHaveBeenCalledWith("comment");
    expect(screen.queryByTestId("notification-filter-menu")).not.toBeInTheDocument();
  });

  it("marks the selected option visually", async () => {
    const user = userEvent.setup();
    render(<NotificationHeader selectedType="follow" onTypeChange={onTypeChange} />);

    await user.click(screen.getByTestId("notification-filter-btn"));

    expect(screen.getByTestId("notification-filter-option-follow")).toHaveClass("text-orange-500");
    expect(screen.getByTestId("notification-filter-option-like")).toHaveClass("text-white");
  });
});
