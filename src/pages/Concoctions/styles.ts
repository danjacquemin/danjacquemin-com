import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';

export const concoctionsStyles = {
  wrapper: {
    position: 'relative',
    height: '560px',
    width: '100%',
    margin: '0 auto',
  } as SxProps<Theme>,

  recipeStack: {
    position: 'relative',
    width: '100%',
    border: '1px dashed blue',
    display: 'flex',
    justifyContent: 'center',
    gap: 3,
  } as SxProps<Theme>,

  recipeCard: (activePosition: number) =>
    ({
      width: 340,
      height: '100%',
      // left: `${activePosition * 370}px`,
      transition: 'left 0.65s cubic-bezier(0.32, 0.72, 0, 1)',
      borderRadius: 2,
      '&:after': {
        content: `"= ${activePosition}"`,
      },
    }) as SxProps<Theme>,

  recipeCardHeader: {
    textAlign: 'center',
    minHeight: '70px',
    paddingY: 2,
  },

  recipeCardContent: {
    textAlign: 'center',
    padding: 0,
  },

  bourbonCard: {
    position: 'absolute',
    top: 0,
    left: 'calc(50% - 170px)',
    width: 340,
    height: '100%',
    border: 0,
    zIndex: 9,
    background: 'transparent',
  },
};
