export interface Mix {
  id: number | string;
  label: string;
  flavor: "listening_history" | "taste_profile";
  coverUrl: string | null;
  trackCount: number;
  generatedAt: string;
  

}
