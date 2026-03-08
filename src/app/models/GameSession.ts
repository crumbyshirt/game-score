/** Represents a multiplayer game session stored in Firebase */
export interface GameSession {
  createdAt: number;
  players: string[];
  scores: Record<string, Record<string, number | null>>;
}
