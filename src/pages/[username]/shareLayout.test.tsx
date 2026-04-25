import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ShareLayout from "@/pages/[username]/shareLayout";

vi.mock("@/components/Profile/ProfileHeader/ProfileHeader", () => ({
  default: () => <div data-test="profile-header" />,
}));

vi.mock("@/components/Profile/ProfileTabs/ProfileTabs", () => ({
  default: ({ tracks }: { tracks?: number }) => (
    <div data-test="profile-tabs" data-tracks={tracks ?? 0} />
  ),
}));

vi.mock("@/components/Profile/ProfileSideBar/ProfileSideBar", () => ({
  default: () => <div data-test="profile-sidebar" />,
}));

vi.mock("@/services/user.service", () => ({
  getMyLikedTracks: vi.fn().mockResolvedValue({
    items: [],
    meta: { total: 0, limit: 0, offset: 0 },
  }),
  getUserLikedTracks: vi.fn().mockResolvedValue({
    items: [],
    meta: { total: 0, limit: 0, offset: 0 },
  }),
  getUserByUsername: vi.fn().mockResolvedValue({
    id: "profile-1",
  }),
}));

describe("ShareLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards track count to ProfileTabs for non-owner profiles", async () => {
    render(
      <ShareLayout
        user={{
          id: "1",
          username: "artist",
          displayName: "Artist",
          firstName: "",
          lastName: "",
          bio: "",
          email: "",
          role: "artist",
          isPro: false,
          following_ids: [],
        }}
        isOwner={false}
        selectedTab="Tracks"
        onTabChange={vi.fn()}
        stats={{ followers: 10, following: 5, tracks: 12 }}
      >
        <div>Child content</div>
      </ShareLayout>,
    );

    expect(await screen.findByTestId("profile-tabs")).toHaveAttribute(
      "data-tracks",
      "12",
    );
  });
});
