import {
  NFLGameFormSchema,
  NFLGameSchema,
  NFLSeasonFormSchema,
  NFLSeasonSchema,
  NFLWeekFormSchema,
  NFLWeekSchema,
} from './schema';

import type { z } from 'zod';

export type NFLGame = z.infer<typeof NFLGameSchema>;
export type NFLGameForm = z.infer<typeof NFLGameFormSchema>;
export type NFLWeek = z.infer<typeof NFLWeekSchema>;
export type NFLWeekForm = z.infer<typeof NFLWeekFormSchema>;
export type NFLSeason = z.infer<typeof NFLSeasonSchema>;
export type NFLSeasonForm = z.infer<typeof NFLSeasonFormSchema>;
