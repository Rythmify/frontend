import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ArtistListSection from "./ArtistListSection";

// ─── Mock Setup ───────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("./FollowButton", () => ({
  default: ({ username }: { username: string }) => (
    <button data-test={`follow-button-${username}`}>Follow</button>
  ),
}));

const mockArtists = [
  {
    username: "travis-scott",
    avatar: "https://example.com/travis.jpg",
    followers: 6234000,
    tracks: 12,
    isVerified: true,
  },
  {
    username: "billie-eilish",
    avatar: "https://example.com/billie.jpg",
    followers: 4500,
    tracks: 8,
    isVerified: false,
  },
  {
    username: "the-weeknd",
    avatar: "https://example.com/weeknd.jpg",
    followers: 850,
    tracks: 0,
    isVerified: true,
  },
  {
    username: "dua-lipa",
    avatar: "https://example.com/dua.jpg",
    followers: 1200000,
    tracks: 5,
    isVerified: true,
  },
];

// ─── Test Suite ───────────────────────────────────────────
describe("ArtistListSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title", () => {
    render(
      <ArtistListSection title="ARTISTS YOU SHOULD FOLLOW" artists={mockArtists} />,
    );
    expect(
      screen.getByTestId("artist-list-section-title"),
    ).toHaveTextContent("ARTISTS YOU SHOULD FOLLOW");
  });

  it("returns null when artists array is empty", () => {
    render(<ArtistListSection title="ARTISTS" artists={[]} />);
    expect(
      screen.queryByTestId("artist-list-section"),
    ).not.toBeInTheDocument();
  });

  it("respects maxDisplay — only shows that many artists", () => {
    render(
      <ArtistListSection title="ARTISTS" artists={mockArtists} maxDisplay={2} />,
    );
    expect(
      screen.getByTestId(`artist-item-${mockArtists[0].username}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`artist-item-${mockArtists[1].username}`),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(`artist-item-${mockArtists[2].username}`),
    ).not.toBeInTheDocument();
  });

  it("shows 'View all' button when viewAllLink is provided", () => {
    render(
      <ArtistListSection
        title="ARTISTS"
        artists={mockArtists}
        viewAllLink="/artists"
      />,
    );
    expect(
      screen.getByTestId("artist-list-section-view-all"),
    ).toHaveTextContent("View all");
  });

  it("does not show 'View all' when viewAllLink is not provided", () => {
    render(
      <ArtistListSection title="ARTISTS" artists={mockArtists} onRefresh={vi.fn()} />,
    );
    expect(
      screen.queryByTestId("artist-list-section-view-all"),
    ).not.toBeInTheDocument();
  });

  it("shows 'Refresh list' button when onRefresh is provided and no viewAllLink", () => {
    render(
      <ArtistListSection
        title="ARTISTS"
        artists={mockArtists}
        onRefresh={vi.fn()}
      />,
    );
    expect(
      screen.getByTestId("artist-list-section-refresh"),
    ).toHaveTextContent("Refresh list");
  });

  it("clicking 'View all' navigates to viewAllLink", () => {
    render(
      <ArtistListSection
        title="ARTISTS"
        artists={mockArtists}
        viewAllLink="/artists"
      />,
    );
    fireEvent.click(screen.getByTestId("artist-list-section-view-all"));
    expect(mockNavigate).toHaveBeenCalledWith("/artists");
  });

  it("clicking 'Refresh list' calls onRefresh", () => {
    const onRefresh = vi.fn();
    render(
      <ArtistListSection
        title="ARTISTS"
        artists={mockArtists}
        onRefresh={onRefresh}
      />,
    );
    fireEvent.click(screen.getByTestId("artist-list-section-refresh"));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("shows verified badge for verified artists", () => {
    render(<ArtistListSection title="ARTISTS" artists={mockArtists} />);
    expect(
      screen.getByTestId(`artist-verified-${mockArtists[0].username}`),
    ).toBeInTheDocument();
  });

  it("hides verified badge for non-verified artists", () => {
    render(<ArtistListSection title="ARTISTS" artists={mockArtists} />);
    expect(
      screen.queryByTestId(`artist-verified-${mockArtists[1].username}`),
    ).not.toBeInTheDocument();
  });

  it("clicking username navigates to /{username}", () => {
    render(<ArtistListSection title="ARTISTS" artists={mockArtists} />);
    fireEvent.click(
      screen.getByTestId(`artist-username-${mockArtists[0].username}`),
    );
    expect(mockNavigate).toHaveBeenCalledWith(`/${mockArtists[0].username}`);
  });

  it("clicking avatar navigates to /{username}", () => {
    render(<ArtistListSection title="ARTISTS" artists={mockArtists} />);
    fireEvent.click(
      screen.getByTestId(`artist-avatar-${mockArtists[0].username}`),
    );
    expect(mockNavigate).toHaveBeenCalledWith(`/${mockArtists[0].username}`);
  });

  it("clicking followers navigates to /{username}/follower", () => {
    render(<ArtistListSection title="ARTISTS" artists={mockArtists} />);
    fireEvent.click(
      screen.getByTestId(`artist-followers-${mockArtists[0].username}`),
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      `/${mockArtists[0].username}/follower`,
    );
  });

  it("formats followers in millions", () => {
    render(<ArtistListSection title="ARTISTS" artists={mockArtists} />);
    expect(
      screen.getByTestId(`artist-followers-${mockArtists[0].username}`),
    ).toHaveTextContent("6.2M");
  });

  it("formats followers in thousands", () => {
    render(<ArtistListSection title="ARTISTS" artists={mockArtists} />);
    expect(
      screen.getByTestId(`artist-followers-${mockArtists[1].username}`),
    ).toHaveTextContent("4.5K");
  });

  it("formats followers as raw number below 1000", () => {
    render(<ArtistListSection title="ARTISTS" artists={mockArtists} />);
    expect(
      screen.getByTestId(`artist-followers-${mockArtists[2].username}`),
    ).toHaveTextContent("850");
  });

  it("renders FollowButton for each displayed artist", () => {
    render(
      <ArtistListSection title="ARTISTS" artists={mockArtists} maxDisplay={3} />,
    );
    expect(
      screen.getByTestId(`follow-button-${mockArtists[0].username}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`follow-button-${mockArtists[1].username}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`follow-button-${mockArtists[2].username}`),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(`follow-button-${mockArtists[3].username}`),
    ).not.toBeInTheDocument();
  });

  it("hides tracks stat when tracks is 0", () => {
    render(<ArtistListSection title="ARTISTS" artists={mockArtists} />);
    // mockArtists[2] has tracks: 0 — track button should not render
    expect(
      screen.queryByTestId(`artist-tracks-${mockArtists[2].username}`),
    ).not.toBeInTheDocument();
  });

  it("shows tracks stat when tracks is greater than 0", () => {
    render(<ArtistListSection title="ARTISTS" artists={mockArtists} />);
    expect(
      screen.getByTestId(`artist-tracks-${mockArtists[0].username}`),
    ).toBeInTheDocument();
  });
});
