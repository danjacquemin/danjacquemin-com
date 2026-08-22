import { z } from 'zod';

import {
  AwayTeamIdSchema,
  BYE_MARKER,
  IdGuidSchema,
  TeamAbbrSchema,
} from '@/features/base/schema';

const gameByeAndMatchupRules = (
  game: {
    awayTeamId: string;
    homeTeamId: string;
    stadiumId: string | null;
  },
  ctx: z.RefinementCtx,
) => {
  const isBye = game.awayTeamId === BYE_MARKER;

  if (isBye && game.stadiumId !== null) {
    ctx.addIssue({
      code: 'custom',
      message: 'Bye weeks must have a null stadiumId',
      path: ['stadiumId'],
    });
  }

  if (!isBye && game.stadiumId === null) {
    ctx.addIssue({
      code: 'custom',
      message: 'Non-bye games require a stadiumId',
      path: ['stadiumId'],
    });
  }

  if (game.awayTeamId === game.homeTeamId) {
    ctx.addIssue({
      code: 'custom',
      message: 'Home and away teams must differ',
      path: ['awayTeamId'],
    });
  }
};

const gamesMatchWeekNumber = (week: {
  games: { week: number }[];
  weekNumber: number;
}) => week.games.every((game) => game.week === week.weekNumber);

const gamesMatchSeasonYear = (season: {
  games: { games: { season: number }[] }[];
  year: number;
}) =>
  season.games.every((week) =>
    week.games.every((game) => game.season === season.year),
  );

// core data shapes
export const NFLGameSchema = z
  .object({
    id: IdGuidSchema,
    season: z.int().min(2020),
    week: z.int().min(1).max(18),
    gameDateTimeUTC: z.union([
      z.iso.datetime({ offset: true }),
      z.literal('TBD'),
    ]),
    stadiumId: IdGuidSchema.nullable(), // null for bye weeks
    homeTeamId: TeamAbbrSchema,
    awayTeamId: AwayTeamIdSchema, // "bye" is a marker, not a real team
    // Human-readable summary for verifying/editing committed JSON.
    // Not core business logic; _ prefix marks auxiliary metadata.
    _summary: z.string().optional(),
  })
  .superRefine(gameByeAndMatchupRules);

export const NFLWeekSchema = z
  .object({
    weekNumber: z.int().min(1).max(18),
    games: z.array(NFLGameSchema),
  })
  .refine(gamesMatchWeekNumber, {
    error: 'Each game.week must match the parent weekNumber',
    path: ['games'],
  });

export const NFLSeasonSchema = z
  .object({
    id: IdGuidSchema,
    year: z.int().min(2020),
    games: z.array(NFLWeekSchema),
  })
  .refine(gamesMatchSeasonYear, {
    error: 'Each game.season must match the season year',
    path: ['games'],
  });

// ui-form validation layer
// -- adds practical editing limits and user-friendly messages to core data shapes
export const NFLGameFormSchema = z
  .object({
    id: IdGuidSchema,
    season: z.int().min(2020, { error: 'Season must be 2020 or later' }),
    week: z.int().min(1).max(18, { error: 'Week must be between 1 and 18' }),
    gameDateTimeUTC: z.union([
      z.iso.datetime({ offset: true }),
      z.literal('TBD'),
    ]),
    stadiumId: IdGuidSchema.nullable(), // null for bye weeks
    homeTeamId: TeamAbbrSchema,
    awayTeamId: AwayTeamIdSchema, // "bye" is a marker, not a real team
    // Human-readable summary for verifying/editing committed JSON.
    // Not core business logic; _ prefix marks auxiliary metadata.
    _summary: z.string().optional(),
  })
  .superRefine(gameByeAndMatchupRules);

export const NFLWeekFormSchema = z
  .object({
    weekNumber: z
      .int()
      .min(1)
      .max(18, { error: 'Week number must be between 1 and 18' }),
    games: z.array(NFLGameFormSchema),
  })
  .refine(gamesMatchWeekNumber, {
    error: 'Each game.week must match the parent weekNumber',
    path: ['games'],
  });

export const NFLSeasonFormSchema = z
  .object({
    id: IdGuidSchema,
    year: z.int().min(2020, { error: 'Season year must be 2020 or later' }),
    games: z.array(NFLWeekFormSchema),
  })
  .refine(gamesMatchSeasonYear, {
    error: 'Each game.season must match the season year',
    path: ['games'],
  });
