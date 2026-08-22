import {
  NFLStadiumFormSchema,
  NFLStadiumListSchema,
  NFLStadiumSchema,
} from './schema';

import type { z } from 'zod';

export type NFLStadium = z.infer<typeof NFLStadiumSchema>;
export type NFLStadiumForm = z.infer<typeof NFLStadiumFormSchema>;
export type NFLStadiumList = z.infer<typeof NFLStadiumListSchema>;
