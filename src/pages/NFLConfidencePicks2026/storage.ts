import { hydrateRows, type WeekCard } from './week';

import type { NFLGame } from '@/features/nfl-schedule';
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

export function loadWeekRows(
  weekNumber: number,
  games: readonly NFLGame[],
  teams: NFLTeamList,
) {
  return hydrateRows(readWeekCard(weekNumber), games, teams, weekNumber);
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
