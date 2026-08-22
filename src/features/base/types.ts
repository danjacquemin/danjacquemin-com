import { AwayTeamIdSchema, IdGuidSchema, TeamAbbrSchema } from './schema';

import type { z } from 'zod';

export type IdGuid = z.infer<typeof IdGuidSchema>;
export type TeamAbbr = z.infer<typeof TeamAbbrSchema>;
export type AwayTeamId = z.infer<typeof AwayTeamIdSchema>;
