export interface StudentRank {
  id: string | number;
  name: string;
  stage: string;
  points: number;
  rank: number;
  imageUrl: string;
  isCurrentUser?: boolean;
}