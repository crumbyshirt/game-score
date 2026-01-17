/** Player model used by AppState */
export interface Player {
  name: string;
  /**
   * The score key is the round number, and the value is the score for that round.
   * If a score is null, it indicates no score has been entered for that round.
   */
  score?: Map<number, number | null>;
}
