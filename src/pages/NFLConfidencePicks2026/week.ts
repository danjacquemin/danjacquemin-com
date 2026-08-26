import { BYE_MARKER } from '@/features/base';

import type { NFLGame, NFLSeason } from '@/features/nfl-schedule';
import type { NFLTeam, NFLTeamList } from '@/features/nfl-teams';

export const REGULAR_SEASON_WEEKS = 18;
export const ET_TIME_ZONE = 'America/New_York';
export const HOUR_MS = 60 * 60 * 1000;

export type WeekCardRow = {
  gameId: string;
  winnerId: string | null;
};

export type WeekCard = {
  rows: WeekCardRow[];
  weekNumber: number;
};

export type QrPayloadV1 = {
  email: string;
  weekNumber: number;
  winners: string[];
};

type CalendarDay = {
  day: number;
  month: number;
  year: number;
};

type EtDateTime = CalendarDay & {
  hour: number;
  minute: number;
  weekday: string;
};

// Wed–Sat belong to the upcoming Sunday slate; Mon–Tue trail the Sunday that just ended.
const WEEKDAY_TO_SUNDAY_DELTA: Record<string, number> = {
  Sun: 0,
  Mon: -1,
  Tue: -2,
  Wed: 4,
  Thu: 3,
  Fri: 2,
  Sat: 1,
};

export function isValidEmail(email: string): boolean {
  // Semicolon and comma would break the v1 QR payload delimiters.
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    !email.includes(';') &&
    !email.includes(',')
  );
}

export function realGames(games: readonly NFLGame[]): NFLGame[] {
  return games.filter((game) => game.awayTeamId !== BYE_MARKER);
}

export function teamDisplayName(
  team: NFLTeam | undefined,
  fallback: string,
): string {
  return team ? `${team.teamCity} ${team.teamName}` : fallback;
}

export function sortRealGames(
  games: readonly NFLGame[],
  teams: NFLTeamList,
): NFLGame[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));

  return [...realGames(games)].sort((a, b) => {
    const aTbd = a.gameDateTimeUTC === 'TBD';
    const bTbd = b.gameDateTimeUTC === 'TBD';
    if (aTbd !== bTbd) return aTbd ? 1 : -1;

    if (!aTbd && !bTbd) {
      const byTime =
        new Date(a.gameDateTimeUTC).getTime() -
        new Date(b.gameDateTimeUTC).getTime();
      if (byTime !== 0) return byTime;
    }

    const aHome = teamDisplayName(teamById.get(a.homeTeamId), a.homeTeamId);
    const bHome = teamDisplayName(teamById.get(b.homeTeamId), b.homeTeamId);
    return aHome.localeCompare(bHome, 'en');
  });
}

export function hydrateRows(
  stored: WeekCard | null,
  games: readonly NFLGame[],
  teams: NFLTeamList,
  weekNumber: number,
): WeekCardRow[] {
  const sorted = sortRealGames(games, teams);
  const storedRows =
    stored && stored.weekNumber === weekNumber ? stored.rows : [];
  const gameById = new Map<string, NFLGame>(
    sorted.map((game) => [game.id, game]),
  );
  const used = new Set<string>();
  const rows: WeekCardRow[] = [];

  for (const row of storedRows) {
    const game = gameById.get(row.gameId);
    if (!game) continue;
    used.add(game.id);
    const winnerOk =
      row.winnerId === game.homeTeamId || row.winnerId === game.awayTeamId;
    rows.push({
      gameId: game.id,
      winnerId: winnerOk ? row.winnerId : null,
    });
  }

  for (const game of sorted) {
    if (used.has(game.id)) continue;
    rows.push({ gameId: game.id, winnerId: null });
  }

  return rows;
}

export function cutoffHasPassed(
  closesAt: Date | null,
  now: number = Date.now(),
): boolean {
  return closesAt !== null && now >= closesAt.getTime();
}

export function weekClosesAt(
  season: NFLSeason,
  weekNumber: number,
): Date | null {
  const week = season.games.find((entry) => entry.weekNumber === weekNumber);
  if (!week) return null;

  const games = realGames(week.games);
  if (games.length === 0) return null;

  const thursday8pm = tbdThursday8pmEt(season, weekNumber);
  const effectiveTimes = games.map((game) => {
    if (game.gameDateTimeUTC !== 'TBD') {
      return new Date(game.gameDateTimeUTC).getTime();
    }
    // Cannot place Thursday without a Sunday slate: treat TBD as already kicked off.
    return thursday8pm?.getTime() ?? 0;
  });

  return new Date(Math.min(...effectiveTimes) - HOUR_MS);
}

export function defaultWeekNumber(
  season: NFLSeason,
  now: Date = new Date(),
): number {
  const windows = season.games
    .map((week) => {
      const dated = realGames(week.games).filter(
        (game) => game.gameDateTimeUTC !== 'TBD',
      );
      if (dated.length === 0) return null;
      const times = dated.map((game) =>
        new Date(game.gameDateTimeUTC).getTime(),
      );
      return {
        end: Math.max(...times),
        start: Math.min(...times),
        weekNumber: week.weekNumber,
      };
    })
    .filter((window): window is NonNullable<typeof window> => window !== null)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  if (windows.length === 0) return 1;

  const t = now.getTime();
  if (t < windows[0].start) return 1;

  for (const window of windows) {
    if (t >= window.start && t <= window.end) return window.weekNumber;
  }

  for (let index = 0; index < windows.length - 1; index += 1) {
    if (t > windows[index].end && t < windows[index + 1].start) {
      return windows[index + 1].weekNumber;
    }
  }

  return REGULAR_SEASON_WEEKS;
}

export function weekDateRange(games: readonly NFLGame[]): string | null {
  const dated = realGames(games)
    .filter((game) => game.gameDateTimeUTC !== 'TBD')
    .map((game) => new Date(game.gameDateTimeUTC).getTime());
  if (dated.length === 0) return null;

  const start = formatEtDate(new Date(Math.min(...dated)));
  const end = formatEtDate(new Date(Math.max(...dated)));
  return start === end ? start : `${start} – ${end}`;
}

export function weekHeading(
  weekNumber: number,
  games: readonly NFLGame[],
): string {
  const range = weekDateRange(games);
  return range ? `Week ${weekNumber} · ${range}` : `Week ${weekNumber}`;
}

export function formatKickoffEt(gameDateTimeUTC: string): string {
  if (gameDateTimeUTC === 'TBD') return 'TBD';

  const formatted = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: 'numeric',
    hour12: true,
    minute: '2-digit',
    month: 'short',
    timeZone: ET_TIME_ZONE,
    weekday: 'short',
  })
    .format(new Date(gameDateTimeUTC))
    .replace(/,/g, '');

  return `${formatted} ET`;
}

export function formatClosesAt(closesAt: Date): string {
  const formatted = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: 'numeric',
    hour12: true,
    minute: '2-digit',
    month: 'short',
    timeZone: ET_TIME_ZONE,
    weekday: 'short',
  })
    .format(closesAt)
    .replace(/,/g, '');

  return `${formatted} ET`;
}

export function encodeQrPayload(
  email: string,
  weekNumber: number,
  winners: string[],
): string {
  return `v1;${email};${weekNumber};${winners.join(',')}`;
}

export function parseQrPayload(text: string): QrPayloadV1 | { error: string } {
  const parts = text.trim().split(';');
  if (parts.length !== 4 || parts[0] !== 'v1') {
    return { error: 'Not a week pick QR' };
  }

  const email = parts[1] ?? '';
  const weekToken = parts[2] ?? '';
  const winnersPart = parts[3] ?? '';

  if (!isValidEmail(email)) {
    return { error: 'Invalid email in QR' };
  }

  if (!/^\d+$/.test(weekToken)) {
    return { error: 'Invalid week in QR' };
  }

  const weekNumber = Number(weekToken);
  if (weekNumber < 1 || weekNumber > REGULAR_SEASON_WEEKS) {
    return { error: 'Invalid week in QR' };
  }

  const winners = winnersPart
    ? winnersPart.split(',').map((abbr) => abbr.trim().toLowerCase())
    : [];

  return { email, weekNumber, winners };
}

export function rowsFromWinnerAbbrs(
  games: readonly NFLGame[],
  winners: string[],
): { rows: WeekCardRow[] } | { error: string } {
  const real = realGames(games);
  if (winners.length !== real.length) {
    return { error: `QR must list ${real.length} winners` };
  }

  const gameByTeam = new Map<string, NFLGame>();
  for (const game of real) {
    gameByTeam.set(game.homeTeamId, game);
    gameByTeam.set(game.awayTeamId, game);
  }

  const seen = new Set<string>();
  const rows: WeekCardRow[] = [];

  for (const abbr of winners) {
    const game = gameByTeam.get(abbr);
    if (!game) {
      return { error: `Team '${abbr}' is not playing this week` };
    }
    if (seen.has(game.id)) {
      return { error: 'Each game can only appear once in the QR' };
    }
    seen.add(game.id);
    rows.push({ gameId: game.id, winnerId: abbr });
  }

  return { rows };
}

export function qrFilename(
  weekNumber: number,
  email: string,
  now: Date = new Date(),
): string {
  const date = now.toISOString().slice(0, 10);
  return `nfl-confidence-w${weekNumber}-${email.replace(/@/g, '[at]')}-${date}.svg`;
}

export function downloadSvg(svg: SVGSVGElement, filename: string): void {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  const svgString = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// TBD games use Thursday 8:00 PM ET of this football week, so any TBD
// freezes the slate at 7:00 PM ET Thursday unless an earlier dated kickoff did.
function tbdThursday8pmEt(season: NFLSeason, weekNumber: number): Date | null {
  const sunday = footballSundayForWeek(season, weekNumber);
  if (!sunday) return null;
  const thursday = addCalendarDays(sunday, -3);
  return zonedLocalToUtc(
    ET_TIME_ZONE,
    thursday.year,
    thursday.month,
    thursday.day,
    20,
    0,
  );
}

function footballSundayForWeek(
  season: NFLSeason,
  weekNumber: number,
): CalendarDay | null {
  const own = season.games.find((week) => week.weekNumber === weekNumber);
  if (own) {
    const sunday = footballSundayFromGames(own.games);
    if (sunday) return sunday;
  }

  for (const other of season.games) {
    const otherSunday = footballSundayFromGames(other.games);
    if (!otherSunday) continue;
    return addCalendarDays(otherSunday, (weekNumber - other.weekNumber) * 7);
  }

  return null;
}

function footballSundayFromGames(
  games: readonly NFLGame[],
): CalendarDay | null {
  const counts = new Map<string, { count: number; day: CalendarDay }>();

  for (const game of realGames(games)) {
    if (game.gameDateTimeUTC === 'TBD') continue;
    const parts = etDateTime(new Date(game.gameDateTimeUTC));
    const delta = WEEKDAY_TO_SUNDAY_DELTA[parts.weekday];
    if (delta === undefined) continue;
    const sunday = addCalendarDays(parts, delta);
    const key = `${sunday.year}-${sunday.month}-${sunday.day}`;
    const prev = counts.get(key);
    counts.set(key, { count: (prev?.count ?? 0) + 1, day: sunday });
  }

  let best: { count: number; day: CalendarDay } | null = null;
  for (const entry of counts.values()) {
    if (
      !best ||
      entry.count > best.count ||
      (entry.count === best.count &&
        compareCalendarDay(entry.day, best.day) < 0)
    ) {
      best = entry;
    }
  }

  return best?.day ?? null;
}

function formatEtDate(date: Date): string {
  const parts = etDateTime(date);
  const month = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  ).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  return `${parts.weekday} ${month} ${parts.day}`;
}

function etDateTime(date: Date): EtDateTime {
  const map = formatPartsMap(date, ET_TIME_ZONE, {
    day: 'numeric',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: 'numeric',
    weekday: 'short',
    year: 'numeric',
  });

  return {
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    month: Number(map.month),
    weekday: map.weekday ?? '',
    year: Number(map.year),
  };
}

function addCalendarDays(day: CalendarDay, delta: number): CalendarDay {
  const utc = new Date(Date.UTC(day.year, day.month - 1, day.day + delta));
  return {
    day: utc.getUTCDate(),
    month: utc.getUTCMonth() + 1,
    year: utc.getUTCFullYear(),
  };
}

function compareCalendarDay(a: CalendarDay, b: CalendarDay): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

function zonedLocalToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const first = new Date(asUtc - timeZoneOffsetMs(new Date(asUtc), timeZone));
  return new Date(asUtc - timeZoneOffsetMs(first, timeZone));
}

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const map = formatPartsMap(date, timeZone, {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    year: 'numeric',
  });
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return asUtc - date.getTime();
}

function formatPartsMap(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone,
  }).formatToParts(date)) {
    if (part.type !== 'literal') map[part.type] = part.value;
  }
  return map;
}
