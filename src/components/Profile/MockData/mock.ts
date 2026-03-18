export const mockFollowing = [
  {
    username: "travis-scott",
    displayName: "Travis Scott",
    followers: 6150000,
    tracks: 174,
    avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg",
    isVerified: true,
  },
  {
    username: "nourabosaif04",
    displayName: "NourAbosaif04",
    followers: 3000,
    tracks: 0,
    avatar: "",
    isVerified: false,
  },
  {
    username: "farah-medhat",
    displayName: "Farah medhat",
    followers: 7000,
    tracks: 0,
    avatar: "",
    isVerified: false,
  },
];

export const mockFollowers = [
  {
    username: "nourabosaif04",
    displayName: "NourAbosaif04",
    followers: 3,
    avatar: "",
    isVerified: false,
  },
  {
    username: "farah-medhat",
    displayName: "Farah medhat",
    followers: 7,
    avatar: "",
    isVerified: false,
  },
  {
    username: "mariam-ramy",
    displayName: "Mariam Ramy",
    followers: 3,
    avatar: "",
    isVerified: false,
  },
];

export const mockLikedTracks = [
  {
    id: "1",
    title: "Green & Purple f/Playboi Carti",
    artist: "Travis Scott",
    coverUrl: "https://i1.sndcdn.com/artworks-000225111730-qbt7bb-t500x500.jpg",
    plays: 66900000,
    likes: 1040000,
    reposts: 69500,
    comments: 9166,
  },
  {
    id: "2",
    title: "SICKO MODE",
    artist: "Travis Scott",
    coverUrl: "https://i1.sndcdn.com/artworks-000225111730-qbt7bb-t500x500.jpg",
    plays: 120000000,
    likes: 2500000,
    reposts: 150000,
    comments: 15000,
  },
];

export const mockUserProfiles: Record<string, {
  displayName: string;
  avatar: string;
  coverUrl: string;
  location: string;
  followers: number;
  following: number;
  tracks: number;
  likedTracks: typeof mockLikedTracks;
}> = {
  "travis-scott": {
    displayName: "Travis Scott",
    avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg",
    coverUrl: "",
    location: "Houston, TX",
    followers: 6150000,
    following: 200,
    tracks: 174,
    likedTracks: [
      {
        id: "3",
        title: "HIGHEST IN THE ROOM",
        artist: "Travis Scott",
        coverUrl: "https://i1.sndcdn.com/artworks-000225111730-qbt7bb-t500x500.jpg",
        plays: 95000000,
        likes: 1800000,
        reposts: 120000,
        comments: 20000,
      },
    ],
  },
  "farah-medhat": {
    displayName: "Farah medhat",
    avatar: "",
    coverUrl: "",
    location: "Cairo, Egypt",
    followers: 7,
    following: 3,
    tracks: 0,
    likedTracks: [],
  },
  "nourabosaif04": {
    displayName: "NourAbosaif04",
    avatar: "",
    coverUrl: "",
    location: "Cairo, Egypt",
    followers: 3,
    following: 1,
    tracks: 0,
    likedTracks: [],
  },
  "mariam-ramy": {
    displayName: "Mariam Ramy",
    avatar: "",
    coverUrl: "",
    location: "Cairo, Egypt",
    followers: 3,
    following: 2,
    tracks: 0,
    likedTracks: [],
  },
};

export const mockUserFollowing: Record<string, typeof mockFollowing> = {
  "travis-scott": mockFollowing,
  "nourabosaif04": [],
  "farah-medhat": [],
};

export const mockUserFollowers: Record<string, typeof mockFollowers> = {
  "travis-scott": mockFollowers,
  "nourabosaif04": mockFollowers.slice(0, 1),
  "farah-medhat": mockFollowers.slice(0, 2),
};