import { Link } from 'react-router-dom';

import { styled } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import Page from '../../templates/Page';

import type { ChipProps } from '@mui/material/Chip';

// the bullet between syllables in the card titles
const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

// styled chip with theme primary color and white text on hover

// Extend ChipProps to include anchor element props
interface ThemedChipProps extends ChipProps {
  href?: string;
  to?: string; // for react-router Link compatibility
}

const ThemedChip = styled(Chip)<ThemedChipProps>(({ theme }) => ({
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.dark}`,
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.common.white,
    color: theme.palette.common.white,
    textShadow: '0 0 1px white', // make the text appear bold
  },
}));

function Home() {
  return (
    <Page title="Home">
      <Typography variant="h1">Hello World!</Typography>

      <Card sx={{ maxWidth: 360, minWidth: 250 }} elevation={3}>
        <CardContent>
          <Typography variant="h2" component="h2" sx={{ pb: 1 }}>
            flot{bull}sam
          </Typography>
          <div>
            <Typography
              sx={{ color: 'text.secondary', display: 'block', pb: 1 }}
              fontSize={'0.875rem'}
            >
              /ˈflätsəm/
              <br />
              noun
            </Typography>
          </div>
          <div>
            <Typography component="p">
              people or things that have been rejected and are regarded as
              worthless.
            </Typography>
          </div>
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <ThemedChip
            label="NFL Pick'em"
            variant="outlined"
            component={Link}
            to="/nfl"
          />
        </CardActions>
      </Card>
    </Page>
  );
}

export default Home;
