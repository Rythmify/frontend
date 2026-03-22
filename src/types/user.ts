export interface User {
  id: number;
  username: string;
  displayName: string;
  avatar?: string;
  followers: number;
  isVerified?: boolean;
}
