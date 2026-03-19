export interface MockUser {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string;
  followerCount: number;
  trackCount: number;
  isFollowing: boolean;
}

export const mockUsers: MockUser[] = [
  {
    id: 1,
    username: "lege-cy",
    displayName: "Lege-Cy",
    avatarUrl: "https://picsum.photos/seed/user1/100/100",
    followerCount: 42000,
    trackCount: 38,
    isFollowing: false,
  },
  {
    id: 2,
    username: "ghaliaa",
    displayName: "Ghaliaa",
    avatarUrl: "https://picsum.photos/seed/user2/100/100",
    followerCount: 31500,
    trackCount: 22,
    isFollowing: true,
  },
  {
    id: 3,
    username: "hadeer-yehya",
    displayName: "Hadeer",
    avatarUrl: "https://picsum.photos/seed/user3/100/100",
    followerCount: 18200,
    trackCount: 61,
    isFollowing: false,
  },
  {
    id: 4,
    username: "nour-yehya",
    displayName: "Nourr",
    avatarUrl: "https://picsum.photos/seed/user4/100/100",
    followerCount: 95000,
    trackCount: 45,
    isFollowing: false,
  },
];

export const mockCurrentUser: MockUser = {
  id: 99,
  username: "shahd",
  displayName: "Shahd Yehya",
  avatarUrl: "https://picsum.photos/seed/shahd/100/100",
  followerCount: 120,
  trackCount: 5,
  isFollowing: false,
};

// Config toggle: swap for real API when ready
export const USE_MOCK_USERS = true;