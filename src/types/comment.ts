export interface CommentAuthor {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export interface Comment {
  comment_id: string;
  track_id: string;
  user_id: string;
  content: string;
  track_timestamp: number;
  like_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  author: CommentAuthor;
}
