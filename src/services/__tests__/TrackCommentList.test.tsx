import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TrackCommentList from "../../pages/[username]/[trackSlug]/components/TrackCommentList";
import type { Comment } from "../../types/comment";
import { MemoryRouter } from "react-router-dom";

// Mock the services
vi.mock("@/services/engagement.service", () => ({
  likeComment: vi.fn().mockResolvedValue(undefined),
  unlikeComment: vi.fn().mockResolvedValue(undefined),
  likeReply: vi.fn().mockResolvedValue(undefined),
  unlikeReply: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/track.service", () => ({
  deleteComment: vi.fn().mockResolvedValue(undefined),
  postReply: vi.fn().mockResolvedValue({
    comment_id: "reply-3",
    content: "New Reply",
    created_at: new Date().toISOString(),
    is_liked_by_me: false,
    like_count: 0,
    author: {
      user_id: "user-123",
      username: "me",
      display_name: "Me",
      avatar_url: "",
    }
  }),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: "user-123", username: "me" }
  }))
}));

const mockComments: Comment[] = [
  {
    comment_id: "comment-1",
    user_id: "user-456",
    track_timestamp: 10,
    content: "First comment",
    created_at: new Date().toISOString(),
    like_count: 5,
    is_liked_by_me: true,
    author: {
      user_id: "user-456",
      username: "other",
      display_name: "Other User",
      avatar_url: ""
    },
    track_id: "track-1",
    reply_count: 1,
    updated_at: new Date().toISOString()
  },
  {
    comment_id: "comment-2",
    user_id: "user-123",
    track_timestamp: 20,
    content: "My own comment",
    created_at: new Date().toISOString(),
    like_count: 0,
    is_liked_by_me: false,
    author: {
      user_id: "user-123",
      username: "me",
      display_name: "Me",
      avatar_url: ""
    },
    track_id: "track-1",
    reply_count: 0,
    updated_at: new Date().toISOString()
  }
];

describe("TrackCommentList", () => {
  const renderList = () => render(
    <MemoryRouter>
      <TrackCommentList
        comments={mockComments}
        trackId="track-1"
        totalComments={3}
        onCommentAdded={vi.fn()}
        onCommentDeleted={vi.fn()}
      />
    </MemoryRouter>
  );

  it("renders correctly with comments", () => {
    renderList();
    expect(screen.getByText("3 Comments")).toBeInTheDocument();
    expect(screen.getByText("First comment")).toBeInTheDocument();
    expect(screen.getByText("My own comment")).toBeInTheDocument();
  });

  it("renders author links correctly", () => {
    renderList();
    const links = screen.getAllByTestId("comment-author-link");
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute("href", "/other");
  });

  it("renders like buttons with correct status", () => {
    renderList();
    const likeBtn = screen.getAllByTestId("button-like-comment")[0];
    expect(likeBtn).toHaveClass("text-[#f50]");
    expect(screen.getByText("5")).toBeInTheDocument(); // Like count
  });

  it("shows delete button for own comment", () => {
    renderList();
    expect(screen.getAllByTestId("button-delete-comment").length).toBe(1);
  });

  it("does not show delete button for others comment", () => {
    renderList();
    // In this view, only the user's own comments get a delete button. Since there's only 1 own comment, length should be 1.
    expect(screen.getAllByTestId("button-delete-comment").length).toBe(1);
  });

  it("shows reply input when reply button is clicked", () => {
    renderList();
    const replyBtn = screen.getAllByTestId("button-reply-comment")[0];
    fireEvent.click(replyBtn);
    expect(screen.getByTestId("input-reply-comment")).toBeInTheDocument();
  });

  it("submits a reply", async () => {
    const { postReply } = await import("@/services/track.service");
    renderList();
    const replyBtn = screen.getAllByTestId("button-reply-comment")[0];
    fireEvent.click(replyBtn);

    const input = screen.getByTestId("input-reply-comment");
    fireEvent.change(input, { target: { value: "New Reply" } });

    const submitBtn = screen.getByTestId("button-post-reply");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(postReply).toHaveBeenCalledWith("comment-1", "New Reply");
    });
  });

  it("likes a comment", async () => {
    const { likeComment } = await import("@/services/engagement.service");
    renderList();
    const likeBtn = screen.getAllByTestId("button-like-comment")[1]; // Not liked yet
    fireEvent.click(likeBtn);

    await waitFor(() => {
      expect(likeComment).toHaveBeenCalledWith("comment-2");
    });
  });

  it("unlikes a comment", async () => {
    const { unlikeComment } = await import("@/services/engagement.service");
    renderList();
    const likeBtn = screen.getAllByTestId("button-like-comment")[0]; // Already liked
    fireEvent.click(likeBtn);

    await waitFor(() => {
      expect(unlikeComment).toHaveBeenCalledWith("comment-1");
    });
  });
});
