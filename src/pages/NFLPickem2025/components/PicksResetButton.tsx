import { Button } from '@mui/material';

import type { UserPicks } from '../types';

import { hasPicksForWeek, removePicksForWeek } from '../utils/gameUtils';

interface PicksResetButtonProps {
  weekNum: number;
  userPicks: UserPicks;
  setUserPicks: (picks: UserPicks) => void;
}

export default function PicksResetButton({
  setUserPicks,
  userPicks,
  weekNum,
}: PicksResetButtonProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '0 0 1rem 0',
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
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          fontWeight: 'bold',
          padding: '0.2em 1em',
          textTransform: 'none',
        }}
        aria-label={`Reset picks for week ${weekNum}`}
      >
        Reset Week {weekNum}
      </Button>
    </div>
  );
}
