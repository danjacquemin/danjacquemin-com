import { Box, Typography } from '@mui/material';
import { memo } from 'react';

/**
 * Component to display teams on bye for a week
 */
interface ByeTeamsProps {
  byeTeams: string[];
}

const ByeTeams = memo(({ byeTeams }: ByeTeamsProps) => {
  // Validate input
  if (!Array.isArray(byeTeams) || byeTeams.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 6, pl: 4 }} fontSize="0.875rem">
      <Typography fontSize="inherit" gutterBottom>
        On Bye:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Typography component="span" fontSize="inherit">
          {byeTeams.join(', ')}
        </Typography>
      </Box>
    </Box>
  );
});

ByeTeams.displayName = 'ByeTeams';
export default ByeTeams;
