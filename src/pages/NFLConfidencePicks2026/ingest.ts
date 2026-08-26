import { z } from 'zod';

import { AwayTeamIdSchema, BYE_MARKER, TeamAbbrSchema } from '@/features/base';
import { NFLSeasonFormSchema, NFLSeasonSchema } from '@/features/nfl-schedule';
import {
  NFLStadiumFormSchema,
  NFLStadiumListSchema,
} from '@/features/nfl-stadiums';
import { NFLTeamFormSchema, NFLTeamListSchema } from '@/features/nfl-teams';

import type { NFLSeason } from '@/features/nfl-schedule';
import type { NFLStadiumList } from '@/features/nfl-stadiums';
import type { NFLTeamList } from '@/features/nfl-teams';

export type SourceFile = 'teams' | 'stadiums' | 'schedule';

export type IngestIssue = {
  message: string;
  path: string;
};

export type SeasonSources = {
  schedule: unknown;
  stadiums: unknown;
  teams: unknown;
};

export type SeasonIngest =
  | {
      season: NFLSeason;
      stadiums: NFLStadiumList;
      status: 'valid';
      teams: NFLTeamList;
    }
  | {
      files: Partial<Record<SourceFile, IngestIssue[]>>;
      schedule: unknown;
      stadiums: unknown;
      status: 'fixable';
      teams: unknown;
    }
  | {
      files: Partial<Record<SourceFile, IngestIssue[]>>;
      status: 'unusable';
    };

const SOURCE_FILE_NAME: Record<SourceFile, string> = {
  schedule: 'schedule-2026.json',
  stadiums: 'stadiums.json',
  teams: 'teams.json',
};

const teamListFormSchema = z.array(NFLTeamFormSchema);
const stadiumListFormSchema = z.array(NFLStadiumFormSchema);

const kickoffSchema = z.union([
  z.iso.datetime({ offset: true }),
  z.literal('TBD'),
]);

export function sourceFileName(file: SourceFile): string {
  return SOURCE_FILE_NAME[file];
}

function formatPath(path: PropertyKey[]): string {
  if (path.length === 0) return '(root)';
  return path.map(String).join('.');
}

function issuesFromZod(error: z.ZodError): IngestIssue[] {
  return error.issues.map((issue) => ({
    message: issue.message,
    path: formatPath(issue.path),
  }));
}

function formOrCoreIssues(
  formResult: z.ZodSafeParseResult<unknown>,
  coreError: z.ZodError,
): IngestIssue[] {
  if (!formResult.success) return issuesFromZod(formResult.error);
  return issuesFromZod(coreError);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type FileParse<T> =
  | { data: T; status: 'valid' }
  | { data: unknown; issues: IngestIssue[]; status: 'fixable' }
  | { issues: IngestIssue[]; status: 'unusable' };

function parseTeamList(data: unknown): FileParse<NFLTeamList> {
  if (!Array.isArray(data) || data.some((row) => !isPlainObject(row))) {
    const parsed = NFLTeamListSchema.safeParse(data);
    return {
      issues: parsed.success
        ? [
            {
              message: 'teams.json must be an array of team objects',
              path: '(root)',
            },
          ]
        : issuesFromZod(parsed.error),
      status: 'unusable',
    };
  }

  const unknownTeams = data.flatMap((row, index) => {
    if (TeamAbbrSchema.safeParse(row.id).success) return [];
    return [
      {
        message: `Unknown team '${String(row.id)}'`,
        path: `${index}.id`,
      },
    ];
  });
  if (unknownTeams.length > 0) {
    return { issues: unknownTeams, status: 'unusable' };
  }

  const core = NFLTeamListSchema.safeParse(data);
  if (core.success) return { data: core.data, status: 'valid' };

  return {
    data,
    issues: formOrCoreIssues(teamListFormSchema.safeParse(data), core.error),
    status: 'fixable',
  };
}

function parseStadiumList(data: unknown): FileParse<NFLStadiumList> {
  if (!Array.isArray(data) || data.some((row) => !isPlainObject(row))) {
    const parsed = NFLStadiumListSchema.safeParse(data);
    return {
      issues: parsed.success
        ? [
            {
              message: 'stadiums.json must be an array of stadium objects',
              path: '(root)',
            },
          ]
        : issuesFromZod(parsed.error),
      status: 'unusable',
    };
  }

  const unknownHomeTeams = data.flatMap((row, index) => {
    if (!Array.isArray(row.homeTeamIds)) return [];
    return row.homeTeamIds.flatMap((id: unknown, teamIndex: number) => {
      if (TeamAbbrSchema.safeParse(id).success) return [];
      return [
        {
          message: `Unknown team '${String(id)}'`,
          path: `${index}.homeTeamIds.${teamIndex}`,
        },
      ];
    });
  });
  if (unknownHomeTeams.length > 0) {
    return { issues: unknownHomeTeams, status: 'unusable' };
  }

  const core = NFLStadiumListSchema.safeParse(data);
  if (core.success) return { data: core.data, status: 'valid' };

  return {
    data,
    issues: formOrCoreIssues(stadiumListFormSchema.safeParse(data), core.error),
    status: 'fixable',
  };
}

function unusableScheduleShape(data: unknown): IngestIssue[] | null {
  if (!isPlainObject(data)) {
    return [
      {
        message: 'schedule-2026.json must be a season object',
        path: '(root)',
      },
    ];
  }

  if (!Array.isArray(data.games)) {
    return [
      {
        message: 'Season games must be an array of weeks',
        path: 'games',
      },
    ];
  }

  const issues: IngestIssue[] = [];

  data.games.forEach((week, weekIndex) => {
    if (!isPlainObject(week)) {
      issues.push({
        message: 'Each week must be an object',
        path: `games.${weekIndex}`,
      });
      return;
    }

    if (!Array.isArray(week.games)) {
      issues.push({
        message: 'Week games must be an array',
        path: `games.${weekIndex}.games`,
      });
      return;
    }

    week.games.forEach((game, gameIndex) => {
      const gamePath = `games.${weekIndex}.games.${gameIndex}`;

      if (!isPlainObject(game)) {
        issues.push({
          message: 'Each game must be an object',
          path: gamePath,
        });
        return;
      }

      if (!TeamAbbrSchema.safeParse(game.homeTeamId).success) {
        issues.push({
          message: `Unknown team '${String(game.homeTeamId)}'`,
          path: `${gamePath}.homeTeamId`,
        });
      }

      if (!AwayTeamIdSchema.safeParse(game.awayTeamId).success) {
        issues.push({
          message: `Unknown team '${String(game.awayTeamId)}'`,
          path: `${gamePath}.awayTeamId`,
        });
      }

      if (!kickoffSchema.safeParse(game.gameDateTimeUTC).success) {
        issues.push({
          message: 'Kickoff must be an ISO-8601 datetime with offset, or TBD',
          path: `${gamePath}.gameDateTimeUTC`,
        });
      }
    });
  });

  return issues.length > 0 ? issues : null;
}

function parseSeason(data: unknown): FileParse<NFLSeason> {
  const shapeIssues = unusableScheduleShape(data);
  if (shapeIssues) {
    return { issues: shapeIssues, status: 'unusable' };
  }

  const core = NFLSeasonSchema.safeParse(data);
  if (core.success) return { data: core.data, status: 'valid' };

  return {
    data,
    issues: formOrCoreIssues(NFLSeasonFormSchema.safeParse(data), core.error),
    status: 'fixable',
  };
}

function referentialIssues(
  teams: NFLTeamList,
  stadiums: NFLStadiumList,
  season: NFLSeason,
): IngestIssue[] {
  const teamIds = new Set(teams.map((team) => team.id));
  const stadiumIds = new Set(stadiums.map((stadium) => stadium.id));
  const issues: IngestIssue[] = [];

  season.games.forEach((week, weekIndex) => {
    week.games.forEach((game, gameIndex) => {
      const gamePath = `games.${weekIndex}.games.${gameIndex}`;

      if (!teamIds.has(game.homeTeamId)) {
        issues.push({
          message: `Unknown team '${game.homeTeamId}'`,
          path: `${gamePath}.homeTeamId`,
        });
      }

      if (game.awayTeamId !== BYE_MARKER && !teamIds.has(game.awayTeamId)) {
        issues.push({
          message: `Unknown team '${game.awayTeamId}'`,
          path: `${gamePath}.awayTeamId`,
        });
      }

      if (game.stadiumId !== null && !stadiumIds.has(game.stadiumId)) {
        issues.push({
          message: `Unknown stadium '${game.stadiumId}'`,
          path: `${gamePath}.stadiumId`,
        });
      }
    });
  });

  return issues;
}

export function ingestSeason(sources: SeasonSources): SeasonIngest {
  const teams = parseTeamList(sources.teams);
  const stadiums = parseStadiumList(sources.stadiums);
  const schedule = parseSeason(sources.schedule);

  const unusable: Partial<Record<SourceFile, IngestIssue[]>> = {};
  if (teams.status === 'unusable') unusable.teams = teams.issues;
  if (stadiums.status === 'unusable') unusable.stadiums = stadiums.issues;
  if (schedule.status === 'unusable') unusable.schedule = schedule.issues;

  if (Object.keys(unusable).length > 0) {
    return { files: unusable, status: 'unusable' };
  }

  const fixable: Partial<Record<SourceFile, IngestIssue[]>> = {};
  if (teams.status === 'fixable') fixable.teams = teams.issues;
  if (stadiums.status === 'fixable') fixable.stadiums = stadiums.issues;
  if (schedule.status === 'fixable') fixable.schedule = schedule.issues;

  if (Object.keys(fixable).length > 0) {
    return {
      files: fixable,
      schedule: sources.schedule,
      stadiums: sources.stadiums,
      status: 'fixable',
      teams: sources.teams,
    };
  }

  if (
    teams.status !== 'valid' ||
    stadiums.status !== 'valid' ||
    schedule.status !== 'valid'
  ) {
    return { files: unusable, status: 'unusable' };
  }

  const refs = referentialIssues(teams.data, stadiums.data, schedule.data);
  if (refs.length > 0) {
    return { files: { schedule: refs }, status: 'unusable' };
  }

  return {
    season: schedule.data,
    stadiums: stadiums.data,
    status: 'valid',
    teams: teams.data,
  };
}
