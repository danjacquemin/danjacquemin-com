import type { WeekScore } from './score';
import type { NFLConfidenceResultWeek } from './types';

import resultsInvalid from './fixtures/results.invalid.json';
import resultsInvalidTie from './fixtures/results.invalid-tie.json';
import resultsValid from './fixtures/results.valid.json';
import weekEntryInvalidBye from './fixtures/week-entry.invalid-bye.json';
import weekEntryInvalid from './fixtures/week-entry.invalid.json';
import weekEntryValid from './fixtures/week-entry.valid.json';
import {
  NFLConfidenceResultsFormSchema,
  NFLConfidenceResultsSchema,
  NFLConfidenceWeekEntryFormSchema,
  NFLConfidenceWeekEntrySchema,
  withWeek,
  withWeekForm,
} from './schema';
import { scoreWeek } from './score';

type ParseCase = {
  data: unknown;
  expectPass: boolean;
  name: string;
  schema: { safeParse: (data: unknown) => { success: boolean } };
};

const weekGames = [
  {
    awayTeamId: 'ne',
    homeTeamId: 'sea',
    id: 'd7f229f7-a0f9-409e-831e-a4053027b1d8',
    week: 1,
  },
  {
    awayTeamId: 'sf',
    homeTeamId: 'lar',
    id: 'baeed6f6-8d95-4692-8ccc-9c7e3c20da2c',
    week: 1,
  },
  {
    awayTeamId: 'bye',
    homeTeamId: 'kc',
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    week: 1,
  },
];

const cases: ParseCase[] = [
  {
    data: weekEntryValid,
    expectPass: true,
    name: 'week-entry.valid.json (core)',
    schema: NFLConfidenceWeekEntrySchema,
  },
  {
    data: weekEntryValid,
    expectPass: true,
    name: 'week-entry.valid.json (form)',
    schema: NFLConfidenceWeekEntryFormSchema,
  },
  {
    data: weekEntryInvalid,
    expectPass: false,
    name: 'week-entry.invalid.json (core)',
    schema: NFLConfidenceWeekEntrySchema,
  },
  {
    data: weekEntryInvalidBye,
    expectPass: false,
    name: 'week-entry.invalid-bye.json (core)',
    schema: NFLConfidenceWeekEntrySchema,
  },
  {
    data: weekEntryValid,
    expectPass: true,
    name: 'week-entry.valid.json (withWeek)',
    schema: withWeek(weekGames),
  },
  {
    data: weekEntryValid,
    expectPass: true,
    name: 'week-entry.valid.json (withWeekForm)',
    schema: withWeekForm(weekGames),
  },
  {
    data: {
      ...weekEntryValid,
      picks: weekEntryValid.picks.map((pick, index) =>
        index === 0 ? { ...pick, winnerId: 'kc' } : pick,
      ),
    },
    expectPass: false,
    name: 'withWeek rejects winner not in the game',
    schema: withWeek(weekGames),
  },
  {
    data: {
      picks: [{ ...weekEntryValid.picks[0], confidence: 1 }],
      weekNumber: 1,
    },
    expectPass: false,
    name: 'withWeek rejects a missing real game',
    schema: withWeek(weekGames),
  },
  {
    data: {
      picks: [
        ...weekEntryValid.picks,
        {
          confidence: 3,
          gameId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          winnerId: 'kc',
        },
      ],
      weekNumber: 1,
    },
    expectPass: false,
    name: 'withWeek rejects a bye game',
    schema: withWeek(weekGames),
  },
  {
    data: resultsValid,
    expectPass: true,
    name: 'results.valid.json (core)',
    schema: NFLConfidenceResultsSchema,
  },
  {
    data: resultsValid,
    expectPass: true,
    name: 'results.valid.json (form)',
    schema: NFLConfidenceResultsFormSchema,
  },
  {
    data: resultsInvalid,
    expectPass: false,
    name: 'results.invalid.json (core)',
    schema: NFLConfidenceResultsSchema,
  },
  {
    data: resultsInvalidTie,
    expectPass: false,
    name: 'results.invalid-tie.json (core)',
    schema: NFLConfidenceResultsSchema,
  },
  {
    data: {
      season: 2026,
      weeks: [
        {
          games: [
            {
              awayScore: 10,
              awayTeamId: 'sea',
              homeScore: 17,
              homeTeamId: 'sea',
              status: 'final',
              winnerId: 'sea',
            },
          ],
          weekNumber: 1,
        },
      ],
    },
    expectPass: false,
    name: 'results reject home === away',
    schema: NFLConfidenceResultsSchema,
  },
];

const failures: string[] = [];

for (const parseCase of cases) {
  const result = parseCase.schema.safeParse(parseCase.data);
  const ok = result.success === parseCase.expectPass;
  const expected = parseCase.expectPass ? 'pass' : 'fail';
  const actual = result.success ? 'pass' : 'fail';
  console.log(
    `${ok ? 'PASS' : 'FAIL'} ${parseCase.name} (expected ${expected}, got ${actual})`,
  );
  if (!ok) failures.push(parseCase.name);
}

const seaId = 'd7f229f7-a0f9-409e-831e-a4053027b1d8';
const larId = 'baeed6f6-8d95-4692-8ccc-9c7e3c20da2c';
const resultsValidWeek = resultsValid.weeks[0] as NFLConfidenceResultWeek;

const completeCard = [
  { gameId: seaId, winnerId: 'sea' },
  { gameId: larId, winnerId: 'sf' },
];

type ScoreCase = {
  expect: WeekScore;
  name: string;
  week: NFLConfidenceResultWeek | null;
  card?: { gameId: string; winnerId: string | null }[];
};

const scoreCases: ScoreCase[] = [
  {
    expect: {
      games: [
        {
          boxScore: 'SEA 24, NE 13',
          correct: true,
          gameId: seaId,
          points: 2,
        },
        {
          boxScore: 'Tie 17–17',
          correct: false,
          gameId: larId,
          points: 0,
        },
      ],
      status: 'posted',
      totals: { correct: 1, points: 2 },
    },
    name: 'scoreWeek posted complete card',
    week: resultsValidWeek,
  },
  {
    card: [
      { gameId: seaId, winnerId: 'sea' },
      { gameId: larId, winnerId: null },
    ],
    expect: {
      games: [
        {
          boxScore: 'SEA 24, NE 13',
          correct: null,
          gameId: seaId,
          points: null,
        },
        {
          boxScore: 'Tie 17–17',
          correct: null,
          gameId: larId,
          points: null,
        },
      ],
      status: 'posted',
      totals: null,
    },
    name: 'scoreWeek posted incomplete card has no totals',
    week: resultsValidWeek,
  },
  {
    expect: { status: 'not-posted' },
    name: 'scoreWeek missing week is not posted',
    week: null,
  },
  {
    expect: { status: 'not-posted' },
    name: 'scoreWeek wrong N is not posted',
    week: { games: [resultsValidWeek.games[0]], weekNumber: 1 },
  },
  {
    expect: { status: 'not-posted' },
    name: 'scoreWeek swapped home/away is not posted',
    week: {
      games: [
        {
          awayScore: 24,
          awayTeamId: 'sea',
          homeScore: 13,
          homeTeamId: 'ne',
          status: 'final',
          winnerId: 'sea',
        },
        resultsValidWeek.games[1],
      ],
      weekNumber: 1,
    },
  },
];

for (const scoreCase of scoreCases) {
  const actual = scoreWeek({
    card: scoreCase.card ?? completeCard,
    games: weekGames,
    resultsWeek: scoreCase.week,
    weekNumber: 1,
  });
  const ok = JSON.stringify(actual) === JSON.stringify(scoreCase.expect);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${scoreCase.name}`);
  if (!ok) {
    console.log('  expected', JSON.stringify(scoreCase.expect));
    console.log('  actual  ', JSON.stringify(actual));
    failures.push(scoreCase.name);
  }
}

if (failures.length > 0) {
  throw new Error(`Fixture parse mismatches: ${failures.join(', ')}`);
}
