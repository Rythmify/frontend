import { http, HttpResponse } from "msw";
import { mockFeedItems } from "../feed";

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const feedHandlers = [
  // GET /feed — activity feed (posts + reposts from followed users)
  http.get("*/feed", () => {
    return HttpResponse.json({
      data: mockFeedItems,
      pagination: {
        page: 1,
        per_page: 20,
        total_items: mockFeedItems.length,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    });
  }),
];
