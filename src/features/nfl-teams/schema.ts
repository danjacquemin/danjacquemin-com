import { z } from 'zod';

import { IdGuidSchema, TeamAbbrSchema } from '@/features/base/schema';

export const NFLConferenceSchema = z.enum(['AFC', 'NFC']);
export const NFLDivisionSchema = z.enum(['East', 'North', 'South', 'West']);

const abbreviationMatchesId = (team: {
  id: string;
  teamAbbreviation: string;
}) => team.id === team.teamAbbreviation.toLowerCase();

// core data shapes
export const NFLTeamLogoSchema = z.object({
  id: IdGuidSchema,
  colorLogo: z.string().min(1),
  knockoutLogo: z.string().min(1),
  altText: z.string().min(1).max(255),
});

export const NFLTeamSchema = z
  .object({
    id: TeamAbbrSchema, // stable lowercase abbreviation as the team's natural ID
    teamName: z.string().min(1),
    teamCity: z.string().min(1),
    teamState: z.string().length(2).toUpperCase(),
    conference: NFLConferenceSchema,
    division: NFLDivisionSchema,
    teamAbbreviation: z.string().min(2).max(3).toUpperCase(),
    teamNicknames: z.array(z.string().min(1)).min(1),
    logos: z.array(NFLTeamLogoSchema).min(1),
    homeStadium: IdGuidSchema,
  })
  .refine(abbreviationMatchesId, {
    error: 'id must be the lowercase team abbreviation',
    path: ['id'],
  });

// ui-form validation layer
// -- adds practical editing limits and user-friendly messages to core data shapes
export const NFLTeamFormSchema = z
  .object({
    id: TeamAbbrSchema, // stable lowercase abbreviation as the team's natural ID
    teamName: z.string().min(1, { error: 'Team name is required' }),
    teamCity: z.string().min(1, { error: 'Team city is required' }),
    teamState: z
      .string()
      .length(2, { error: 'State must be exactly 2 characters' })
      .toUpperCase(),
    conference: z.enum(['AFC', 'NFC'], {
      error: 'Conference must be AFC or NFC',
    }),
    division: z.enum(['East', 'North', 'South', 'West'], {
      error: 'Division must be East, North, South or West',
    }),
    teamAbbreviation: z
      .string()
      .min(2, { error: 'Abbreviation must be 2–3 characters' })
      .max(3, { error: 'Abbreviation must be 2–3 characters' })
      .toUpperCase(),
    teamNicknames: z
      .array(z.string().min(1))
      .min(1, { error: 'At least one nickname is required' }),
    logos: z
      .array(NFLTeamLogoSchema)
      .min(1, { error: 'At least one logo is required' }),
    homeStadium: IdGuidSchema,
  })
  .refine(abbreviationMatchesId, {
    error: 'id must be the lowercase team abbreviation',
    path: ['id'],
  });

export const NFLTeamListSchema = z.array(NFLTeamSchema);
