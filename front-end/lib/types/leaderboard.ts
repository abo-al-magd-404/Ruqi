// Leaderboard types: the normalized student rank row shown on leaderboards.

export interface StudentRank {
  id: string | number;
  name: string;
  stage: string;
  points: number;
  rank: number;
  imageUrl: string;
  isCurrentUser?: boolean;
}