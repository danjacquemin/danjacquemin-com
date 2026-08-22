import {
  NFLConferenceSchema,
  NFLDivisionSchema,
  NFLTeamFormSchema,
  NFLTeamListSchema,
  NFLTeamLogoSchema,
  NFLTeamSchema,
} from './schema';

import type { z } from 'zod';

export type NFLConference = z.infer<typeof NFLConferenceSchema>;
export type NFLDivision = z.infer<typeof NFLDivisionSchema>;
export type NFLTeam = z.infer<typeof NFLTeamSchema>;
export type NFLTeamForm = z.infer<typeof NFLTeamFormSchema>;
export type NFLTeamLogo = z.infer<typeof NFLTeamLogoSchema>;
export type NFLTeamList = z.infer<typeof NFLTeamListSchema>;
