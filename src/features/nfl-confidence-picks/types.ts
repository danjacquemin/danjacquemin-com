import {
  NFLConfidencePickFormSchema,
  NFLConfidencePickSchema,
  NFLConfidenceResultGameFormSchema,
  NFLConfidenceResultGameSchema,
  NFLConfidenceResultWeekFormSchema,
  NFLConfidenceResultWeekSchema,
  NFLConfidenceResultsFormSchema,
  NFLConfidenceResultsSchema,
  NFLConfidenceWeekEntryFormSchema,
  NFLConfidenceWeekEntryListSchema,
  NFLConfidenceWeekEntrySchema,
} from './schema';

import type { z } from 'zod';

export type { ConfidenceWeekGame } from './schema';

export type NFLConfidencePick = z.infer<typeof NFLConfidencePickSchema>;
export type NFLConfidencePickForm = z.infer<typeof NFLConfidencePickFormSchema>;
export type NFLConfidenceWeekEntry = z.infer<
  typeof NFLConfidenceWeekEntrySchema
>;
export type NFLConfidenceWeekEntryForm = z.infer<
  typeof NFLConfidenceWeekEntryFormSchema
>;
export type NFLConfidenceWeekEntryList = z.infer<
  typeof NFLConfidenceWeekEntryListSchema
>;
export type NFLConfidenceResultGame = z.infer<
  typeof NFLConfidenceResultGameSchema
>;
export type NFLConfidenceResultGameForm = z.infer<
  typeof NFLConfidenceResultGameFormSchema
>;
export type NFLConfidenceResultWeek = z.infer<
  typeof NFLConfidenceResultWeekSchema
>;
export type NFLConfidenceResultWeekForm = z.infer<
  typeof NFLConfidenceResultWeekFormSchema
>;
export type NFLConfidenceResults = z.infer<typeof NFLConfidenceResultsSchema>;
export type NFLConfidenceResultsForm = z.infer<
  typeof NFLConfidenceResultsFormSchema
>;
