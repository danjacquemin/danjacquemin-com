import { Link } from 'react-router-dom';

import { styled } from '@mui/material/styles';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import type { ChipProps } from '@mui/material/Chip';

interface ThemedChipProps extends ChipProps {
  to?: string;
}

const ThemedChip = styled(Chip)<ThemedChipProps>(({ theme }) => ({
  '&:focus': { outline: `2px solid ${theme.palette.primary.dark}` },
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderColor: theme.palette.common.white,
    textShadow: '0 0 1px white',
  },
}));

export interface HomeCardData {
  title: React.ReactNode;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  chipLabel?: string;
  chipTo?: string;
}

export default function HomeCard({
  title,
  pronunciation,
  partOfSpeech,
  definition,
  chipLabel,
  chipTo,
}: HomeCardData) {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        mt: '1em',
        maxWidth: '22.5em',
        minWidth: '15.625em',
      }}
      elevation={3}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h2" component="h2" sx={{ pb: '0.5em' }}>
          {title}
        </Typography>

        <Typography
          sx={{ color: 'text.secondary', display: 'block', pb: '0.5em' }}
          fontSize="0.875rem"
        >
          {pronunciation}
          <br />
          {partOfSpeech}
        </Typography>

        <Typography component="p">{definition}</Typography>
      </CardContent>

      {chipLabel && chipTo && (
        <CardActions sx={{ p: '0 1.25em 1.25em' }}>
          <ThemedChip
            label={chipLabel}
            variant="outlined"
            component={Link}
            to={chipTo}
          />
        </CardActions>
      )}
    </Card>
  );
}
