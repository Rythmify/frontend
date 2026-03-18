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
  likedTracks: [
    {
      id: "4",
      title: "Blinding Lights",
      artist: "The Weeknd",
      coverUrl: "https://i1.sndcdn.com/artworks-000225111730-qbt7bb-t500x500.jpg",
      plays: 200000000,
      likes: 3000000,
      reposts: 200000,
      comments: 30000,
    },
    {
      id: "5",
      title: "STARGAZING",
      artist: "Travis Scott",
      coverUrl: "https://i1.sndcdn.com/artworks-000225111730-qbt7bb-t500x500.jpg",
      plays: 80000000,
      likes: 1200000,
      reposts: 90000,
      comments: 12000,
    },
  ],
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

export const mockUserFollowers: Record<string, typeof mockFollowers> = {
  "farah-medhat": [
    { username: "NourAbosaif04", displayName: "NourAbosaif04", followers: 3, avatar: "", isVerified: false },
    { username: "Mariam Ramy", displayName: "Mariam Ramy", followers: 3, avatar: "", isVerified: false },
    { username: "travis-scott", displayName: "Travis Scott", followers: 6150000, avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg", isVerified: true },
    { username: "Alyaa Mohamed", displayName: "Alyaa Mohamed", followers: 4, avatar: "", isVerified: false },
    { username: "Rowida Ahmed", displayName: "Rowida Ahmed", followers: 4, avatar: "", isVerified: false },
    { username: "Ahmed Ali", displayName: "Ahmed Ali", followers: 2, avatar: "", isVerified: false },
    { username: "Sara Mohamed", displayName: "Sara Mohamed", followers: 1, avatar: "", isVerified: false },
  ],
  "nourabosaif04": [
    { username: "farah-medhat", displayName: "Farah medhat", followers: 7, avatar: "", isVerified: false },
    { username: "Mariam Ramy", displayName: "Mariam Ramy", followers: 3, avatar: "", isVerified: false },
    { username: "travis-scott", displayName: "Travis Scott", followers: 6150000, avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg", isVerified: true },
  ],
  "travis-scott": mockFollowers,
  "mariam-ramy": [
    { username: "NourAbosaif04", displayName: "NourAbosaif04", followers: 3, avatar: "", isVerified: false },
    { username: "farah-medhat", displayName: "Farah medhat", followers: 7, avatar: "", isVerified: false },
    { username: "travis-scott", displayName: "Travis Scott", followers: 6150000, avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg", isVerified: true },
  ],
};

export const mockUserFollowing: Record<string, typeof mockFollowing> = {
  "farah-medhat": [
    { username: "travis-scott", displayName: "Travis Scott", followers: 6150000, tracks: 174, avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg", isVerified: true },
    { username: "nourabosaif04", displayName: "NourAbosaif04", followers: 3000, tracks: 0, avatar: "", isVerified: false },
    { username: "mariam-ramy", displayName: "Mariam Ramy", followers: 3, tracks: 0, avatar: "", isVerified: false },
  ],
  "nourabosaif04": [
    { username: "travis-scott", displayName: "Travis Scott", followers: 6150000, tracks: 174, avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg", isVerified: true },
  ],
  "travis-scott": mockFollowing,
  "mariam-ramy": [
    { username: "travis-scott", displayName: "Travis Scott", followers: 6150000, tracks: 174, avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg", isVerified: true },
    { username: "farah-medhat", displayName: "Farah medhat", followers: 7000, tracks: 0, avatar: "", isVerified: false },
  ],
};