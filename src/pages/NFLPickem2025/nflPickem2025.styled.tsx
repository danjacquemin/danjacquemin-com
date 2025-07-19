import { TableCell, TableBody } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

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

/**
 * Styled TableBody to remove bottom border from last team row per division
 */
export const StyledTableBody = styled(TableBody)`
  & > :not(:first-of-type) > td,
  & > tr:not(:has(th)):last-of-type > td {
    border-bottom: none;
  }
`;

/**
 * Styled TableCell for division headers
 */
export const StyledDivisionHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  fontSize: '0.875rem',
  fontWeight: 'bold',
}));

/**
 * Styled TableCell for game cells
 */
export const StyledGameCell = styled(TableCell)({
  fontSize: '0.625rem',
  padding: '4px 2px',
  textAlign: 'center',
});

/**
 * Styled TableCell for team cells
 */
export const StyledTeamCell = styled(TableCell)({
  fontSize: '0.75rem',
  textAlign: 'center',
});

export const StyledDataGrid = styled(DataGrid)(() => ({
  '& .MuiDataGrid-columnHeader': {
    cursor: 'auto',
  },

  '& .MuiDataGrid-cell': {
    padding: '0',
    borderLeft: '1px solid white',
  },

  // the text of the header cells
  '& .MuiDataGrid-columnHeaderTitleContainerContent': {
    whiteSpace: 'nowrap',
    fontWeight: '500',
    padding: '0 0.5em',
  },

  // always show the vertical header cell menu
  '& .MuiDataGrid-menuIcon': {
    visibility: 'visible',
    width: 'auto',
  },

  // ensures the sort icon takes up space when not visible
  '& .MuiDataGrid-iconButtonContainer': {
    visibility: 'visible ',
    position: 'absolute',
    top: '4px',
    right: '-6px',
    height: '6px',
    width: '6px',
  },

  // remove the column separators
  '.MuiDataGrid-columnSeparator': {
    display: 'none',
  },

  '& .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus':
    {
      outline: 'none',
    },
}));
