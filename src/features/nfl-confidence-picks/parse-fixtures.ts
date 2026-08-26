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

if (failures.length > 0) {
  throw new Error(`Fixture parse mismatches: ${failures.join(', ')}`);
}
