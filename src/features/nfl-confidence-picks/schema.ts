import { z } from 'zod';

import {
  BYE_MARKER,
  IdGuidSchema,
  TeamAbbrSchema,
} from '@/features/base/schema';

export type ConfidenceWeekGame = {
  awayTeamId: string;
  homeTeamId: string;
  id: string;
  week?: number;
};

type ConfidencePickValue = {
  confidence: number;
  gameId: string;
  winnerId: string;
};

type WeekEntryValue = {
  picks: ConfidencePickValue[];
  weekNumber: number;
};

type ResultGameValue = {
  awayScore: number;
  awayTeamId: string;
  homeScore: number;
  homeTeamId: string;
  status: 'final' | 'tie';
  winnerId: string | null;
};

const uniqueGameIdsAndConfidencePermutation = (
  entry: WeekEntryValue,
  ctx: z.RefinementCtx,
) => {
  const gameIds = entry.picks.map((pick) => pick.gameId);
  if (new Set(gameIds).size !== gameIds.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Each game can only appear once',
      path: ['picks'],
    });
  }

  const ranks = [...entry.picks.map((pick) => pick.confidence)].sort(
    (a, b) => a - b,
  );
  const isPermutation = ranks.every((rank, index) => rank === index + 1);
  if (!isPermutation) {
    ctx.addIssue({
      code: 'custom',
      message:
        'Confidence ranks must be a permutation of 1 through the number of games',
      path: ['picks'],
    });
  }
};

// Self-contained entries cannot see the slate; bind the week's games to check coverage and winners.
const weekEntryMatchesGames =
  (games: readonly ConfidenceWeekGame[]) =>
  (entry: WeekEntryValue, ctx: z.RefinementCtx) => {
    const byeIds = new Set(
      games
        .filter((game) => game.awayTeamId === BYE_MARKER)
        .map((game) => game.id),
    );
    const realGames = games.filter((game) => game.awayTeamId !== BYE_MARKER);
    const realById = new Map(realGames.map((game) => [game.id, game]));

    const boundWeeks = realGames
      .map((game) => game.week)
      .filter((week): week is number => week !== undefined);
    if (boundWeeks.some((week) => week !== entry.weekNumber)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Week number must match the bound games',
        path: ['weekNumber'],
      });
    }

    const pickIdSet = new Set(entry.picks.map((pick) => pick.gameId));

    entry.picks.forEach((pick, index) => {
      if (byeIds.has(pick.gameId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Bye games cannot be ranked',
          path: ['picks', index, 'gameId'],
        });
        return;
      }

      const game = realById.get(pick.gameId);
      if (!game) {
        ctx.addIssue({
          code: 'custom',
          message: 'Unknown game for this week',
          path: ['picks', index, 'gameId'],
        });
        return;
      }

      if (
        pick.winnerId !== game.homeTeamId &&
        pick.winnerId !== game.awayTeamId
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Winner must be the home or away team of that game',
          path: ['picks', index, 'winnerId'],
        });
      }
    });

    const missingOrExtra =
      pickIdSet.size !== realGames.length ||
      realGames.some((game) => !pickIdSet.has(game.id));
    if (missingOrExtra) {
      ctx.addIssue({
        code: 'custom',
        message: 'Every real game in the week must appear exactly once',
        path: ['picks'],
      });
    }
  };

const resultGameScoreRules = (game: ResultGameValue, ctx: z.RefinementCtx) => {
  if (game.homeTeamId === game.awayTeamId) {
    ctx.addIssue({
      code: 'custom',
      message: 'Home and away teams must differ',
      path: ['awayTeamId'],
    });
  }

  if (game.status === 'tie') {
    if (game.awayScore !== game.homeScore) {
      ctx.addIssue({
        code: 'custom',
        message: 'Tied games must have equal scores',
        path: ['homeScore'],
      });
    }
    return;
  }

  if (game.awayScore === game.homeScore) {
    ctx.addIssue({
      code: 'custom',
      message: 'Final games must have a winner',
      path: ['status'],
    });
    return;
  }

  const expectedWinner =
    game.homeScore > game.awayScore ? game.homeTeamId : game.awayTeamId;
  if (game.winnerId !== expectedWinner) {
    ctx.addIssue({
      code: 'custom',
      message: 'Winner must be the side with the higher score',
      path: ['winnerId'],
    });
  }
};

const resultWeekIntegrity = (
  week: { games: ResultGameValue[] },
  ctx: z.RefinementCtx,
) => {
  const matchups = new Set<string>();
  const teams = new Set<string>();

  week.games.forEach((game, index) => {
    const matchup = `${game.awayTeamId}@${game.homeTeamId}`;
    if (matchups.has(matchup)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Each matchup can only appear once in a week',
        path: ['games', index],
      });
    }
    matchups.add(matchup);

    for (const teamId of [game.awayTeamId, game.homeTeamId]) {
      if (teams.has(teamId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Each team can only play once in a week',
          path: ['games', index],
        });
      }
      teams.add(teamId);
    }
  });
};

const uniqueResultWeekNumbers = (
  season: { weeks: { weekNumber: number }[] },
  ctx: z.RefinementCtx,
) => {
  const seen = new Set<number>();
  season.weeks.forEach((week, index) => {
    if (seen.has(week.weekNumber)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Each weekNumber can only appear once',
        path: ['weeks', index, 'weekNumber'],
      });
    }
    seen.add(week.weekNumber);
  });
};

// core data shapes
export const NFLConfidencePickSchema = z.object({
  gameId: IdGuidSchema,
  winnerId: TeamAbbrSchema,
  confidence: z.int().min(1),
});

export const NFLConfidenceWeekEntrySchema = z
  .object({
    weekNumber: z.int().min(1).max(18),
    picks: z.array(NFLConfidencePickSchema).min(1),
  })
  .superRefine(uniqueGameIdsAndConfidencePermutation);

export const NFLConfidenceWeekEntryListSchema = z.array(
  NFLConfidenceWeekEntrySchema,
);

export function withWeek(games: readonly ConfidenceWeekGame[]) {
  return NFLConfidenceWeekEntrySchema.superRefine(weekEntryMatchesGames(games));
}

const NFLConfidenceResultFinalSchema = z.object({
  awayTeamId: TeamAbbrSchema,
  homeTeamId: TeamAbbrSchema,
  winnerId: TeamAbbrSchema,
  status: z.literal('final'),
  awayScore: z.int().min(0),
  homeScore: z.int().min(0),
  // Human-readable summary for verifying/editing committed JSON.
  // Not core business logic; _ prefix marks auxiliary metadata.
  _summary: z.string().optional(),
});

const NFLConfidenceResultTieSchema = z.object({
  awayTeamId: TeamAbbrSchema,
  homeTeamId: TeamAbbrSchema,
  winnerId: z.null(),
  status: z.literal('tie'),
  awayScore: z.int().min(0),
  homeScore: z.int().min(0),
  // Human-readable summary for verifying/editing committed JSON.
  // Not core business logic; _ prefix marks auxiliary metadata.
  _summary: z.string().optional(),
});

export const NFLConfidenceResultGameSchema = z
  .discriminatedUnion('status', [
    NFLConfidenceResultFinalSchema,
    NFLConfidenceResultTieSchema,
  ])
  .superRefine(resultGameScoreRules);

export const NFLConfidenceResultWeekSchema = z
  .object({
    weekNumber: z.int().min(1).max(18),
    games: z.array(NFLConfidenceResultGameSchema).min(1),
  })
  .superRefine(resultWeekIntegrity);

export const NFLConfidenceResultsSchema = z
  .object({
    season: z.int().min(2020),
    weeks: z.array(NFLConfidenceResultWeekSchema),
  })
  .superRefine(uniqueResultWeekNumbers);

// ui-form validation layer
// -- adds practical editing limits and user-friendly messages to core data shapes
export const NFLConfidencePickFormSchema = z.object({
  gameId: IdGuidSchema,
  winnerId: TeamAbbrSchema,
  confidence: z
    .int()
    .min(1, { error: 'Confidence must be at least 1' })
    .max(16, { error: 'Confidence must be between 1 and 16' }),
});

export const NFLConfidenceWeekEntryFormSchema = z
  .object({
    weekNumber: z
      .int()
      .min(1)
      .max(18, { error: 'Week number must be between 1 and 18' }),
    picks: z
      .array(NFLConfidencePickFormSchema)
      .min(1, { error: 'At least one pick is required' })
      .max(16, { error: 'A week has at most 16 games' }),
  })
  .superRefine(uniqueGameIdsAndConfidencePermutation);

export function withWeekForm(games: readonly ConfidenceWeekGame[]) {
  return NFLConfidenceWeekEntryFormSchema.superRefine(
    weekEntryMatchesGames(games),
  );
}

const NFLConfidenceResultFinalFormSchema = z.object({
  awayTeamId: TeamAbbrSchema,
  homeTeamId: TeamAbbrSchema,
  winnerId: TeamAbbrSchema,
  status: z.literal('final', {
    error: 'Status must be final or tie',
  }),
  awayScore: z.int().min(0, { error: 'Score must be a non-negative integer' }),
  homeScore: z.int().min(0, { error: 'Score must be a non-negative integer' }),
  // Human-readable summary for verifying/editing committed JSON.
  // Not core business logic; _ prefix marks auxiliary metadata.
  _summary: z.string().optional(),
});

const NFLConfidenceResultTieFormSchema = z.object({
  awayTeamId: TeamAbbrSchema,
  homeTeamId: TeamAbbrSchema,
  winnerId: z.null(),
  status: z.literal('tie', {
    error: 'Status must be final or tie',
  }),
  awayScore: z.int().min(0, { error: 'Score must be a non-negative integer' }),
  homeScore: z.int().min(0, { error: 'Score must be a non-negative integer' }),
  // Human-readable summary for verifying/editing committed JSON.
  // Not core business logic; _ prefix marks auxiliary metadata.
  _summary: z.string().optional(),
});

export const NFLConfidenceResultGameFormSchema = z
  .discriminatedUnion('status', [
    NFLConfidenceResultFinalFormSchema,
    NFLConfidenceResultTieFormSchema,
  ])
  .superRefine(resultGameScoreRules);

export const NFLConfidenceResultWeekFormSchema = z
  .object({
    weekNumber: z
      .int()
      .min(1)
      .max(18, { error: 'Week number must be between 1 and 18' }),
    games: z
      .array(NFLConfidenceResultGameFormSchema)
      .min(1, { error: 'A listed week must include at least one game' }),
  })
  .superRefine(resultWeekIntegrity);

export const NFLConfidenceResultsFormSchema = z
  .object({
    season: z.int().min(2020, { error: 'Season must be 2020 or later' }),
    weeks: z.array(NFLConfidenceResultWeekFormSchema),
  })
  .superRefine(uniqueResultWeekNumbers);
