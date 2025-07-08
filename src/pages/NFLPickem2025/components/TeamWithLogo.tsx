import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type TeamWithLogoProps = {
  teamName: string;
  abbr: string;
  fontSize?: string | number;
  logoSize?: string | number;
};

function TeamWithLogo({
  abbr,
  fontSize = 'inherit',
  logoSize = 48,
  teamName,
}: TeamWithLogoProps) {
  return (
    <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
      <img
        src={`./svg/nfl-logos/${abbr}.svg`}
        alt=""
        height={logoSize}
        style={{ flexShrink: 0 }}
        onError={(e) => {
          // Fallback if SVG doesn't exist
          e.currentTarget.style.display = 'none';
        }}
        role="presentation"
      />
      <Typography fontSize={fontSize} component="span">
        {teamName}
      </Typography>
    </Box>
  );
}

export default TeamWithLogo;
