import { Box } from '@mui/material';

import Typography from '@mui/material/Typography';

import type { HomeCardData } from '../../components/HomeCard';

import HomeCard from '../../components/HomeCard';
import Page from '../../templates/Page';

// the bullet between syllables in the card titles
const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '0.125em', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

// -- -- --
// render
//

const cards: readonly HomeCardData[] = [
  {
    title: <>flot{bull}sam</>,
    pronunciation: '/ˈflätsəm/',
    partOfSpeech: 'noun',
    definition:
      'debris in the water that was not deliberately thrown overboard',
    // no chip for now
  },
  {
    title: <>jet{bull}sam</>,
    pronunciation: '/ˈjetsəm/',
    partOfSpeech: 'noun',
    definition:
      "debris that was deliberately thrown overboard by a crew of a ship in distress, most often to lighten the ship's load",
    chipLabel: "2025 NFL Pick'em",
    chipTo: '/nfl',
  },
  {
    title: (
      <>
        con{bull}coc{bull}tions
      </>
    ),
    pronunciation: '/kənˈkäkSHəns/',
    partOfSpeech: 'noun',
    definition: 'a mixture of various ingredients or elements',
    chipLabel: '2oz of what?',
    chipTo: '/concoctions',
  },
] as const;

function Home() {
  return (
    <Page title="Home">
      <Typography variant="h1">Hello World!</Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 4,
        }}
      >
        {cards.map((card, index) => (
          <HomeCard key={index} {...card} />
        ))}
      </Box>
    </Page>
  );
}

export default Home;
