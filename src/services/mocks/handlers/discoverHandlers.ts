import { http, HttpResponse } from "msw";
import { mockDiscoverTracks } from "@/mocks/discover";

export const discoverHandlers = [
  // GET /discover/recommended
  http.get("*/discover/recommended", () => {
    return HttpResponse.json({
      data: mockDiscoverTracks,
      message: "Recommended tracks fetched successfully.",
    });
  }),

  // // GET /discover/mixes
  // http.get("*/discover/mixes", () => {
  //   return HttpResponse.json({
  //     data: mockMixes,
  //     message: "Mixes fetched successfully.",
  //   });
  // }),

  // GET /user/history
  http.get("*/user/history", () => {
    return HttpResponse.json({
      data: mockDiscoverTracks.slice(0, 3),
      message: "Listening history fetched successfully.",
    });
  }),
];
