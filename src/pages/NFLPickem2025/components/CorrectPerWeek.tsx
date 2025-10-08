import { MaterialReactTable } from 'material-react-table';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';

import type { UserPicks } from '../types';

import gameSchedule from '../data/NFLScheduleOfGames.json';

import type { MRT_ColumnDef, MRT_Cell } from 'material-react-table';

// -- -- --

const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

const commonCellStyles = {
  padding: `0.2rem 0.2rem`,
};

const commonHeaderCellStyles = {
  ...commonCellStyles,
  borderBottom: 0,
};

const commonBodyCellStyles = {
  ...commonCellStyles,
  borderTop: `1px solid lightgray`,
  borderBottom: 0,
};

type CorrectPerWeekData = {
  id: number;
  user: string;
  totalCorrect: number;
  [key: string]: string | number; // week columns
};

type CorrectPerWeekProps = {
  userResults: { [key: string]: UserPicks };
  seasonResults: UserPicks;
};

// calculate correct picks for a specific week
const calculateWeekCorrect = (
  userPicks: UserPicks,
  seasonResults: UserPicks,
  week: number,
): number => {
  let correct = 0;

  // get all games for this week
  const weekGames = gameSchedule.filter((game) => game.startsWith(`${week}-`));

  weekGames.forEach((game) => {
    const [, awayTeam, , homeTeam] = game.split('-');
    const gameId = `w-${week}-${awayTeam}-vs-${homeTeam}`;

    // check if game has been played and user pick matches result
    if (seasonResults[gameId] && seasonResults[gameId] !== '-') {
      if (userPicks[gameId] === seasonResults[gameId]) {
        correct++;
      }
    }
  });

  return correct;
};

// calculate total correct picks for all weeks
const calculateTotalCorrect = (
  userPicks: UserPicks,
  seasonResults: UserPicks,
): number => {
  let total = 0;
  Object.keys(userPicks).forEach((gameId) => {
    if (seasonResults[gameId] && seasonResults[gameId] !== '-') {
      if (userPicks[gameId] === seasonResults[gameId]) {
        total++;
      }
    }
  });
  return total;
};

function CorrectPerWeek({ userResults, seasonResults }: CorrectPerWeekProps) {
  const columns = useMemo<MRT_ColumnDef<CorrectPerWeekData>[]>(
    () => [
      // user column (sticky)
      {
        accessorKey: 'user',
        size: 200,
        header: 'User',
        Header: () => <span>&nbsp;</span>, // create something to enable the click-sort (cannot be empty)
        'aria-label': 'User', // but we still need an accessible label
        muiTableHeadCellProps: {
          sx: {
            ...commonHeaderCellStyles,
            position: 'sticky', // fixes the columns header
            left: 0, // to the left
            zIndex: 2, // and on top of other cells while scrolling
            '& .MuiBadge-root': {
              display: 'none',
            },
            cursor: `pointer`,
          },
        },
        Cell: ({ cell }: { cell: MRT_Cell<CorrectPerWeekData, unknown> }) => {
          const userValue = cell.getValue() as string;
          const [user] = userValue.split('@');
          return <Typography sx={{}}>{user.toLowerCase()}</Typography>;
        },
        muiTableBodyCellProps: {
          sx: {
            ...commonBodyCellStyles,
            position: 'sticky', // fixes the columns header
            left: 0, // to the left
            zIndex: 2, // and on top of other cells while scrolling
          },
        },
      },
      // total correct column (sticky)
      {
        accessorKey: 'totalCorrect',
        size: 80,
        header: 'Total',
        muiTableHeadCellProps: {
          sx: {
            ...commonHeaderCellStyles,
            position: 'sticky', // fixes the columns header
            left: 200, // to the right of the user column
            zIndex: 2, // and on top of other cells while scrolling
            fontSize: '0.875rem',
            // (badly) hide the sort trigger and center the header text
            '& .Mui-TableHeadCell-Content-Labels': {
              flexBasis: '100%',
            },
            '& .Mui-TableHeadCell-Content-Wrapper': {
              margin: '0 auto',
            },
            '& .MuiBadge-root': {
              display: 'none',
            },
          },
        },
        Cell: ({ cell }: { cell: MRT_Cell<CorrectPerWeekData, unknown> }) => {
          const totalCorrect = cell.getValue() as number;
          return <Box sx={{ textAlign: 'center' }}>{totalCorrect}</Box>;
        },
        muiTableBodyCellProps: {
          sx: {
            ...commonBodyCellStyles,
            position: 'sticky', // fixes the columns header
            left: 200, // to the right of the user column
            zIndex: 2, // and on top of other cells while scrolling
          },
        },
      },
      // week columns
      ...WEEKS.map((week) => ({
        accessorKey: `week${week}`,
        size: 80,
        header: `Week ${week}`,
        muiTableHeadCellProps: {
          sx: {
            ...commonHeaderCellStyles,
            fontSize: '0.875rem',
            // center the header text
            '& .Mui-TableHeadCell-Content-Labels': {
              flexBasis: '100%',
            },
            '& .Mui-TableHeadCell-Content-Wrapper': {
              margin: '0 auto',
            },
            '& .MuiBadge-root': {
              display: 'none',
            },
          },
        },
        Cell: ({ cell }: { cell: MRT_Cell<CorrectPerWeekData, unknown> }) => {
          const correctCount = cell.getValue() as number;
          return (
            <Box sx={{ textAlign: 'center', fontWeight: '500' }}>
              {correctCount === 0 ? '-' : correctCount}
            </Box>
          );
        },
        muiTableBodyCellProps: {
          sx: {
            ...commonBodyCellStyles,
          },
        },
      })),
    ],
    [],
  );

  // Define table data
  const tableData = useMemo<CorrectPerWeekData[]>(() => {
    return Object.keys(userResults)
      .filter((key) => key !== 'results') // hide the 'results' row
      .map((key, index) => {
        const totalCorrect = calculateTotalCorrect(
          userResults[key],
          seasonResults,
        );

        const row: CorrectPerWeekData = {
          id: index,
          user: key,
          totalCorrect,
        };

        // calculate correct picks for each week
        WEEKS.forEach((week) => {
          const weekCorrect = calculateWeekCorrect(
            userResults[key],
            seasonResults,
            week,
          );
          row[`week${week}`] = weekCorrect;
        });

        return row;
      });
  }, [userResults, seasonResults]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h2" sx={{ mb: 2 }}>
        Per Week
      </Typography>
      <MaterialReactTable<CorrectPerWeekData>
        columns={columns}
        data={tableData}
        initialState={{
          density: 'compact',
          sorting: [{ desc: true, id: 'totalCorrect' }],
        }}
        enableHiding={false}
        enableTopToolbar={false}
        enableBottomToolbar={false}
        enableColumnActions={false}
        enableSorting={true}
        muiTablePaperProps={{ elevation: 0, sx: { border: 0 } }}
        muiTableHeadRowProps={{ sx: { boxShadow: 0, border: 0 } }}
      />
    </Box>
  );
}

export default CorrectPerWeek;
