import { styled } from '@mui/material/styles';

export const HiddenRadioInput = styled('input')(() => ({
  border: 0,
  clip: 'rect(0, 0, 0, 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
}));

export const TeamLabel = styled('label')<{ checked?: boolean }>(
  ({ checked, theme }) => ({
    '&:focus-within': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    },
    '&:hover': {
      backgroundColor: checked
        ? theme.palette.primary.light + '20'
        : theme.palette.action.hover,
    },
    alignItems: 'center',
    backgroundColor: checked
      ? theme.palette.primary.light + '14'
      : 'transparent',
    border: `2px solid ${checked ? theme.palette.primary.main : 'transparent'}`,
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    display: 'flex',
    padding: theme.spacing(1),
    transition: theme.transitions.create(['border-color', 'background-color'], {
      duration: theme.transitions.duration.short,
    }),
  }),
);
