import type { UserPicks } from '../types';

import { VALID_WEEKS } from '../consts';

/**
 * Validates week number
 */
export const isValidWeek = (weekNum: number): boolean => {
  return Number.isInteger(weekNum) && VALID_WEEKS.includes(weekNum);
};

/**
 * Validates team string
 */
export const isValidTeam = (team: string): boolean => {
  return typeof team === 'string' && team.trim().length > 0;
};

/**
 * Gets the number of picks made for a specific week
 */
export function getPicksForWeek(picks: UserPicks, weekNum: number): number {
  if (!isValidWeek(weekNum)) {
    console.warn(`Invalid week number: ${weekNum}`);
    return 0;
  }
  return Object.keys(picks).filter((id) => id.startsWith(`w-${weekNum}-`))
    .length;
}

/**
 * Creates a standardized game ID for tracking picks using team abbreviations
 */
export function createGameId(
  weekNum: number,
  awayTeam: string,
  homeTeam: string,
  getTeamAbbr: (teamName: string) => string,
): string {
  if (!isValidWeek(weekNum)) {
    console.warn(`Invalid week number: ${weekNum}`);
    return '';
  }
  if (!isValidTeam(awayTeam) || !isValidTeam(homeTeam)) {
    console.warn(`Invalid team name: away=${awayTeam}, home=${homeTeam}`);
    return '';
  }
  return `w-${weekNum}-${getTeamAbbr(awayTeam)}-vs-${getTeamAbbr(homeTeam)}`;
}

/**
 * Checks if there are any picks for a specific week
 */
export function hasPicksForWeek(picks: UserPicks, weekNum: number): boolean {
  if (!isValidWeek(weekNum)) {
    console.warn(`Invalid week number: ${weekNum}`);
    return false;
  }
  return Object.keys(picks).some((id) => id.startsWith(`w-${weekNum}-`));
}

/**
 * Removes all picks for a specific week
 */
export function removePicksForWeek(
  picks: UserPicks,
  weekNum: number,
): UserPicks {
  if (!isValidWeek(weekNum)) {
    console.warn(`Invalid week number: ${weekNum}`);
    return { ...picks };
  }
  return Object.fromEntries(
    Object.entries(picks).filter(([id]) => !id.startsWith(`w-${weekNum}-`)),
  );
}
