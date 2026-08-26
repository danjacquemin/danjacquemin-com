import { BYE_MARKER } from '@/features/base/schema';

import type { NFLConfidenceResultGame, NFLConfidenceResultWeek } from './types';

import { withWeek, type ConfidenceWeekGame } from './schema';

export type ConfidenceCardRow = {
  gameId: string;
  winnerId: string | null;
};

export type WeekGameScore = {
  boxScore: string;
  correct: boolean | null;
  gameId: string;
  points: number | null;
};

export type WeekScore =
  | { status: 'not-posted' }
  | {
      games: WeekGameScore[];
      status: 'posted';
      totals: { correct: number; points: number } | null;
    };

function matchupKey(awayTeamId: string, homeTeamId: string): string {
  return `${awayTeamId}@${homeTeamId}`;
}

function formatBoxScore(game: NFLConfidenceResultGame): string {
  if (game.status === 'tie') {
    return `Tie ${game.awayScore}–${game.homeScore}`;
  }

  const winnerIsHome = game.winnerId === game.homeTeamId;
  const winnerAbbr = (
    winnerIsHome ? game.homeTeamId : game.awayTeamId
  ).toUpperCase();
  const loserAbbr = (
    winnerIsHome ? game.awayTeamId : game.homeTeamId
  ).toUpperCase();
  const winnerScore = winnerIsHome ? game.homeScore : game.awayScore;
  const loserScore = winnerIsHome ? game.awayScore : game.homeScore;
  return `${winnerAbbr} ${winnerScore}, ${loserAbbr} ${loserScore}`;
}

function postedByMatchup(
  realGames: readonly ConfidenceWeekGame[],
  resultsWeek: NFLConfidenceResultWeek,
): Map<string, NFLConfidenceResultGame> | null {
  // A well-formed week that is not 1:1 with the slate still must not score.
  if (resultsWeek.games.length !== realGames.length) return null;

  const byMatchup = new Map<string, NFLConfidenceResultGame>();
  for (const game of resultsWeek.games) {
    const key = matchupKey(game.awayTeamId, game.homeTeamId);
    if (byMatchup.has(key)) return null;
    byMatchup.set(key, game);
  }

  if (byMatchup.size !== realGames.length) return null;

  for (const game of realGames) {
    if (!byMatchup.has(matchupKey(game.awayTeamId, game.homeTeamId))) {
      return null;
    }
  }

  return byMatchup;
}

export function scoreWeek({
  card,
  games,
  resultsWeek,
  weekNumber,
}: {
  card: readonly ConfidenceCardRow[];
  games: readonly ConfidenceWeekGame[];
  resultsWeek: NFLConfidenceResultWeek | null | undefined;
  weekNumber: number;
}): WeekScore {
  const realGames = games.filter((game) => game.awayTeamId !== BYE_MARKER);

  if (!resultsWeek || resultsWeek.weekNumber !== weekNumber) {
    return { status: 'not-posted' };
  }

  const byMatchup = postedByMatchup(realGames, resultsWeek);
  if (!byMatchup) return { status: 'not-posted' };

  const postedGames: WeekGameScore[] = [];
  for (const game of realGames) {
    const result = byMatchup.get(matchupKey(game.awayTeamId, game.homeTeamId));
    if (!result) return { status: 'not-posted' };
    postedGames.push({
      boxScore: formatBoxScore(result),
      correct: null,
      gameId: game.id,
      points: null,
    });
  }

  const winnersOk = card.every(
    (row): row is { gameId: string; winnerId: string } => row.winnerId !== null,
  );
  if (!winnersOk) {
    return { games: postedGames, status: 'posted', totals: null };
  }

  const parsed = withWeek(games).safeParse({
    picks: card.map((row, index) => ({
      confidence: card.length - index,
      gameId: row.gameId,
      winnerId: row.winnerId,
    })),
    weekNumber,
  });
  if (!parsed.success) {
    return { games: postedGames, status: 'posted', totals: null };
  }

  const realById = new Map(realGames.map((game) => [game.id, game]));
  const n = card.length;
  let correctCount = 0;
  let pointsTotal = 0;
  const scoredGames: WeekGameScore[] = [];

  for (const [index, row] of card.entries()) {
    const game = realById.get(row.gameId);
    const result = game
      ? byMatchup.get(matchupKey(game.awayTeamId, game.homeTeamId))
      : undefined;
    if (!game || !result) {
      return { games: postedGames, status: 'posted', totals: null };
    }

    const rank = n - index;
    // Ties score 0.
    const correct =
      result.status === 'final' && result.winnerId === row.winnerId;
    const points = correct ? rank : 0;
    if (correct) correctCount += 1;
    pointsTotal += points;
    scoredGames.push({
      boxScore: formatBoxScore(result),
      correct,
      gameId: row.gameId,
      points,
    });
  }

  return {
    games: scoredGames,
    status: 'posted',
    totals: { correct: correctCount, points: pointsTotal },
  };
}
