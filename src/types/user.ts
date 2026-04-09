export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  followers: number;
  isVerified?: boolean;
}
