import { Box, Button } from '@mui/material';
import { memo } from 'react';

import type { UserPicks } from '../types';

import {
  hasPicksForWeek,
  removePicksForWeek,
  isValidWeek,
} from '../utils/gameUtils';

interface PicksResetButtonProps {
  weekNum: number;
  userPicks: UserPicks;
  setUserPicks: (picks: UserPicks) => void;
}

/**
 * Validates user picks
 */
const isValidUserPicks = (userPicks: UserPicks): boolean => {
  return userPicks !== null && typeof userPicks === 'object';
};

/**
 * Button to reset picks for a specific week
 */
const PicksResetButton = memo(
  ({ setUserPicks, userPicks, weekNum }: PicksResetButtonProps) => {
    // Validate inputs
    if (!isValidWeek(weekNum)) {
      console.warn(`Invalid week number: ${weekNum}`);
      return null;
    }
    if (!isValidUserPicks(userPicks)) {
      console.warn('Invalid userPicks');
      return null;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingBottom: 2,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          disabled={!hasPicksForWeek(userPicks, weekNum)}
          onClick={(e) => {
            e.stopPropagation();
            setUserPicks(removePicksForWeek(userPicks, weekNum));
          }}
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            borderRadius: 2,
            fontWeight: 'bold',
            padding: '0.2em 1em',
            textTransform: 'none',
          }}
          aria-label={`Reset picks for week ${weekNum}`}
        >
          Reset Week {weekNum}
        </Button>
      </Box>
    );
  },
);

PicksResetButton.displayName = 'PicksResetButton';

export default PicksResetButton;
