import { Box, Card, CardHeader, CardContent } from '@mui/material';

import Typography from '@mui/material/Typography';

import { concoctionsStyles } from './styles';
import Page from '../../templates/Page';

const drinkRecipes = [
  { id: 1, name: 'Old Fashioned', restOfRecipe: '...' },
  { id: 2, name: 'Manhattan', restOfRecipe: '...' },
  { id: 3, name: 'Boston Sour', restOfRecipe: '...' },
];

function Concoctions() {
  return (
    <Page title="Concoctions">
      <Typography variant="h1">Concoctions</Typography>

      <Box sx={concoctionsStyles.wrapper}>
        <Box sx={concoctionsStyles.recipeStack}>
          {drinkRecipes.map((drink, idx) => {
            const activePosition = idx;

            return (
              <Card
                key={drink.id}
                sx={concoctionsStyles.recipeCard(activePosition)}
              >
                <CardHeader
                  title={drink.name}
                  sx={concoctionsStyles.recipeCardHeader}
                />
                <CardContent sx={concoctionsStyles.recipeCardContent}>
                  <Typography variant="body1">2 oz Bourbon</Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
        <Card sx={concoctionsStyles.bourbonCard} elevation={0}>
          <CardHeader title={' '} sx={concoctionsStyles.recipeCardHeader} />
          <CardContent sx={concoctionsStyles.recipeCardContent}>
            <Typography variant="body1">2 oz Bourbon</Typography>
          </CardContent>
        </Card>
      </Box>
    </Page>
  );
}

export default Concoctions;
