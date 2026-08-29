import { scoreWeek } from '@/features/nfl-confidence-picks';

import { hydrateRows, realGames, type WeekCard } from './week';

import type { NFLConfidenceResults } from '@/features/nfl-confidence-picks';
import type { NFLGame, NFLSeason } from '@/features/nfl-schedule';
import type { NFLTeamList } from '@/features/nfl-teams';

export const USER_EMAIL_KEY = 'userEmail';

export function weekStorageKey(weekNumber: number): string {
  return `nflConfidence2026-week-${weekNumber}`;
}

export function readUserEmail(): string {
  try {
    return localStorage.getItem(USER_EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
}

export function writeUserEmail(email: string): void {
  try {
    localStorage.setItem(USER_EMAIL_KEY, email);
  } catch {
    // Private mode or quota: keep working from memory.
  }
}

export function readWeekCard(weekNumber: number): WeekCard | null {
  try {
    const raw = localStorage.getItem(weekStorageKey(weekNumber));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isWeekCard(parsed) || parsed.weekNumber !== weekNumber) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeWeekCard(card: WeekCard): void {
  try {
    localStorage.setItem(weekStorageKey(card.weekNumber), JSON.stringify(card));
  } catch {
    // Private mode or quota: keep working from memory.
  }
}

export function clearWeekCard(weekNumber: number): void {
  try {
    localStorage.removeItem(weekStorageKey(weekNumber));
  } catch {
    // Private mode or quota: keep working from memory.
  }
}

export function loadWeekRows(
  weekNumber: number,
  games: readonly NFLGame[],
  teams: NFLTeamList,
) {
  return hydrateRows(readWeekCard(weekNumber), games, teams, weekNumber);
}

export function thisPlayerSeasonTotal({
  results,
  season,
  teams,
}: {
  results: NFLConfidenceResults | null;
  season: NFLSeason;
  teams: NFLTeamList;
}): number {
  let points = 0;

  for (const week of season.games) {
    const games = realGames(week.games);
    if (games.length === 0) continue;

    const scored = scoreWeek({
      card: loadWeekRows(week.weekNumber, week.games, teams),
      games,
      resultsWeek: results?.weeks.find(
        (entry) => entry.weekNumber === week.weekNumber,
      ),
      weekNumber: week.weekNumber,
    });

    if (scored.status === 'posted' && scored.totals) {
      points += scored.totals.points;
    }
  }

  return points;
}

function isWeekCard(value: unknown): value is WeekCard {
  if (typeof value !== 'object' || value === null) return false;
  const card = value as Partial<WeekCard>;
  if (typeof card.weekNumber !== 'number' || !Array.isArray(card.rows)) {
    return false;
  }
  return card.rows.every(
    (row) =>
      typeof row === 'object' &&
      row !== null &&
      typeof row.gameId === 'string' &&
      (row.winnerId === null || typeof row.winnerId === 'string'),
  );
}
