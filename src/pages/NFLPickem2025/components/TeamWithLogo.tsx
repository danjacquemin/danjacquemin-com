import { memo } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { PICKEM } from '../consts';

type TeamWithLogoProps = {
  teamName: string;
  abbr: string;
  fontSize?: string | number;
  logoSize?: string | number;
};

const TeamWithLogo = memo(
  ({
    abbr,
    fontSize = 'inherit',
    logoSize = PICKEM.STANDARD_LOGO_SIZE,
    teamName,
  }: TeamWithLogoProps) => {
    // Validate props
    if (!abbr || !teamName) {
      console.warn('TeamWithLogo: Missing abbr or teamName');
      return null;
    }

    return (
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
        <img
          src={`./svg/nfl-logos/${abbr}.svg`}
          alt=""
          height={logoSize}
          style={{ flexShrink: 0 }}
          onError={(e) => {
            e.currentTarget.src = './svg/nfl-logos/placeholder.svg';
            console.warn(`Logo not found for ${abbr}`);
          }}
          role="presentation"
        />
        <Typography
          fontSize={fontSize}
          component="span"
          sx={{ whiteSpace: 'nowrap' }}
        >
          {teamName}
        </Typography>
      </Box>
    );
  },
);

TeamWithLogo.displayName = 'TeamWithLogo';

export default TeamWithLogo;
