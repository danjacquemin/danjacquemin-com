import { z } from 'zod';

export const IdGuidSchema = z
  .uuid({ error: 'Invalid unique identifier format' })
  .brand('IdGuid');

// Browser/Node crypto is enough; no uuid package.
export function newId() {
  return IdGuidSchema.parse(crypto.randomUUID());
}

export const NFL_TEAM_ABBRS = [
  'ari',
  'atl',
  'bal',
  'buf',
  'car',
  'chi',
  'cin',
  'cle',
  'dal',
  'den',
  'det',
  'gb',
  'hou',
  'ind',
  'jax',
  'kc',
  'lac',
  'lar',
  'lv',
  'mia',
  'min',
  'ne',
  'no',
  'nyg',
  'nyj',
  'phi',
  'pit',
  'sea',
  'sf',
  'tb',
  'ten',
  'was',
] as const;

// Official NFL abbreviation as a natural key (lowercase).
// Most teams are 3 letters; a handful are 2 (GB, KC, LV, NE, NO, SF, TB).
export const TeamAbbrSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.enum(NFL_TEAM_ABBRS));

export const BYE_MARKER = 'bye' as const;
export const ByeMarkerSchema = z.literal(BYE_MARKER);

export const AwayTeamIdSchema = z.union([TeamAbbrSchema, ByeMarkerSchema]);
