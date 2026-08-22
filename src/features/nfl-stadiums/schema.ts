import { z } from 'zod';

import { IdGuidSchema, TeamAbbrSchema } from '@/features/base/schema';

const yearClosedAfterOpened = (stadium: {
  yearClosed: number | null;
  yearOpened: number;
}) => stadium.yearClosed === null || stadium.yearClosed >= stadium.yearOpened;

// core data shapes
export const NFLStadiumSchema = z
  .object({
    id: IdGuidSchema,
    stadiumName: z.string().min(1),
    previousNames: z.array(z.string().min(1)).nullable(),
    stadiumNickname: z.string().min(1).nullable(), // some stadiums have no special nickname (null is accurate)

    homeTeamIds: z.array(TeamAbbrSchema), // empty allowed for neutral/international venues
    capacity: z.int().positive(),
    playingSurface: z.string().min(1),
    roofType: z.string().min(1),
    yearOpened: z.int().min(1850), // MCG (1853) and other historic international venues
    yearClosed: z.int().min(1850).nullable(),

    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(2).max(3).toUpperCase(), // 2–3 char region codes (VIC, ENG, RJ, BAV)
    zip: z.string().min(1).max(12), // AU 4-digit, UK N17 0BX, BR with hyphen, etc.
    country: z.string().min(2).max(56), // ISO country name, not a 2-letter code

    visited: z.boolean().default(false),
    visitDeets: IdGuidSchema.nullable(),
  })
  .refine(yearClosedAfterOpened, {
    error: 'Year closed must be on or after year opened',
    path: ['yearClosed'],
  });

// ui-form validation layer
// -- adds practical editing limits and user-friendly messages to core data shapes
export const NFLStadiumFormSchema = z
  .object({
    id: IdGuidSchema,
    stadiumName: z.string().min(1, { error: 'Stadium name is required' }),
    previousNames: z.array(z.string().min(1)).nullable(),
    stadiumNickname: z
      .string()
      .min(1, {
        error: 'Stadium nickname must be at least 1 character if provided',
      })
      .nullable(), // some stadiums have no special nickname (null is accurate)

    homeTeamIds: z.array(TeamAbbrSchema).min(0, {
      error: 'Home team(s) optional for neutral/international sites',
    }),
    capacity: z
      .int()
      .positive({ error: 'Capacity must be a positive integer' }),
    playingSurface: z.string().min(1, { error: 'Playing surface is required' }),
    roofType: z.string().min(1, { error: 'Roof type is required' }),
    yearOpened: z
      .int()
      .min(1850, { error: 'Year opened must be 1850 or later' }), // MCG (1853) and other historic international venues
    yearClosed: z
      .int()
      .min(1850, { error: 'Year closed must be 1850 or later' })
      .nullable(),

    address: z.string().min(1, { error: 'Street address is required' }),
    city: z.string().min(1, { error: 'City is required' }),
    state: z
      .string()
      .min(2, {
        error: 'Region/state code required (2-3 characters e.g. VIC, ENG, NY)',
      })
      .max(3)
      .toUpperCase(),
    zip: z
      .string()
      .min(1, { error: 'Postal code is required' })
      .max(12, { error: 'Postal code too long' }),
    country: z.string().min(2, { error: 'Country is required' }).max(56),

    visited: z.boolean().default(false),
    visitDeets: IdGuidSchema.nullable(),
  })
  .refine(yearClosedAfterOpened, {
    error: 'Year closed must be on or after year opened',
    path: ['yearClosed'],
  });

export const NFLStadiumListSchema = z.array(NFLStadiumSchema);
