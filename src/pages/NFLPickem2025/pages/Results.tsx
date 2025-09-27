import jsQR from 'jsqr';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Cell,
} from 'material-react-table';
import { Box, Typography } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';

import type { UserPicks } from '../types';

import { PICKEM } from '../consts';
import gameSchedule from '../data/NFLScheduleOfGames.json';
import Page from '../../../templates/Page';

// Define proper type for table row data
type TableRowData = {
  [key: string]: string | number;
  id: number;
  user: string;
  correct: number;
  gamesPlayed: number;
};

// -- -- --

const pathToQrfiles = '/pickem2025/';
const qrFiles = [
  `nfl-picks-jacquemin[at]gmail.com-2025-08-30.svg`,
  'nfl-picks-Rjvredsox[at]msn.com-2025-08-31.svg',
  'nfl-picks-bquinn1169[at]gmail.com-2025-08-23.svg',
  'nfl-picks-bill.quinn[at]gmail.com-2025-08-23.svg',
  'nfl-picks-jverrochio[at]gmail.com-2025-09-04.svg',
  'nfl-picks-ehtprincipal[at]hotmail.com-2025-09-04.svg',
  'nfl-picks-Ryansullivan418[at]gmail.com-2025-09-04.svg',
  'nfl-picks-heatherbeequinn[at]gmail.com-2025-09-04.svg',
  'nfl-picks-gfuller64[at]gmail.com-2025-09-04.svg',
];

const SHOW_RESULTS = true;
const RESULTS_SVG = 'results/nfl-picks-results-2025-09-23.svg';
const FULL_SCHEDULE_SIZE = 272;
const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

/**
 * Processes QR code SVG data to extract user picks
 */
const processQRData = (
  qrData: string,
  setError: (error: string | null) => void,
): { key: string; picks: UserPicks } | null => {
  try {
    const match = qrData.match(/data=([^;]+);(.+)/);
    if (!match) throw new Error('Invalid QR data format.');

    const [, key, picksPart] = match;
    const picks = picksPart.trim();

    if (picks.length !== FULL_SCHEDULE_SIZE && !/w\d+-results/.test(key)) {
      setError(
        `Pick count mismatch: expected ${FULL_SCHEDULE_SIZE}, got ${picks.length}.`,
      );
      return null;
    }

    if (!/^[01-]*$/.test(picks)) {
      console.error('Picks must contain only 0s and 1s.');
      setError('Picks must contain only 0s and 1s.');
      return null;
    }

    const userPicks: UserPicks = {};
    picks.split('').forEach((pick, index) => {
      if (pick) {
        const gameID = gameSchedule[index];
        const [week, awayTeam, , homeTeam] = gameID.split('-');
        const key = `w-${week}-${awayTeam}-vs-${homeTeam}`;

        userPicks[key] =
          pick === '-' ? '-' : pick === '1' ? homeTeam : awayTeam;
      }
    });

    setError(null);
    return { key, picks: userPicks };
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error processing QR data.');
    return null;
  }
};

// -- -- --

function Results() {
  const [userResults, setUserResults] = useState<{ [key: string]: UserPicks }>(
    {},
  );
  const [seasonResults, setSeasonResults] = useState<UserPicks>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (SHOW_RESULTS) {
      if (!qrFiles.includes(RESULTS_SVG)) {
        qrFiles.push(RESULTS_SVG);
      }
    }
  }, []);

  useEffect(() => {
    const loadQRCodes = async () => {
      setLoading(true);
      const newResults: { [key: string]: UserPicks } = {};

      for (const file of qrFiles) {
        try {
          const response = await fetch(`${pathToQrfiles}${file}`);
          const svgText = await response.text();
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setError('Could not get canvas context.');
            continue;
          }

          const img = new Image();
          img.src = `data:image/svg+xml;base64,${btoa(svgText)}`;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = () => {
              setError(`Error loading SVG: ${file}`);
              resolve(null);
            };
          });

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            const qrResult = processQRData(code.data, setError);
            if (qrResult) {
              newResults[qrResult.key] = qrResult.picks;
            }
          } else {
            setError(`No QR code found in ${file}.`);
          }
        } catch (err) {
          setError(
            `Error processing ${file}: ${err instanceof Error ? err.message : 'Unknown error'}`,
          );
        }
      }

      // Sort keys so the "results" appear first
      const sortedResults: { [key: string]: UserPicks } = {};
      Object.keys(newResults)
        .sort((a, b) => {
          const aIsResults = /results/.test(a);
          const bIsResults = /results/.test(b);
          if (aIsResults && !bIsResults) return -1;
          if (!aIsResults && bIsResults) return 1;
          return a.localeCompare(b);
        })
        .forEach((key) => {
          sortedResults[key] = newResults[key];
        });

      setUserResults(sortedResults);
      if (sortedResults['results']) {
        setSeasonResults(sortedResults['results']);
      }
      setLoading(false);
    };

    loadQRCodes();
  }, []);

  // Calculate games played and correct picks
  const calculateStats = (picks: UserPicks, seasonResults: UserPicks) => {
    let gamesPlayed = 0;
    let correct = 0;
    Object.keys(picks).forEach((gameId) => {
      if (seasonResults[gameId]) {
        gamesPlayed++;
        if (picks[gameId] === seasonResults[gameId]) {
          correct++;
        }
      }
    });
    return { correct, gamesPlayed };
  };

  const columns = useMemo<MRT_ColumnDef<TableRowData>[]>(
    () => [
      // User column (sticky)
      {
        accessorKey: 'user',
        Cell: ({ cell }: { cell: MRT_Cell<TableRowData, unknown> }) => {
          const userValue = cell.getValue() as string;
          const [user] = userValue.split('@');
          return (
            <Typography sx={{ fontWeight: 'bold', padding: '0.5rem' }}>
              {user.toLowerCase()}
            </Typography>
          );
        },
        enableColumnActions: false,
        enableSorting: true,
        header: 'User',
        muiTableBodyCellProps: {
          sx: {
            backgroundColor: 'white',
            borderRight: '2px solid #ddd',
            left: 0,
            position: 'sticky',
            zIndex: 2,
          },
        },
        muiTableHeadCellProps: {
          sx: {
            backgroundColor: '#1976d2',
            color: 'white',
            fontWeight: 'bold',
            left: 0,
            position: 'sticky',
            zIndex: 3,
          },
        },
        size: 200,
      },
      // Correct picks column (sticky)
      {
        accessorKey: 'correct',
        Cell: ({ cell }: { cell: MRT_Cell<TableRowData, unknown> }) => {
          const correctValue = cell.getValue() as number;
          return (
            <Box sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              {correctValue}
            </Box>
          );
        },
        enableColumnActions: false,
        header: 'Correct',
        muiTableBodyCellProps: {
          sx: {
            backgroundColor: 'white',
            borderRight: '2px solid #ddd',
            left: 200,
            position: 'sticky',
            zIndex: 2,
          },
        },
        muiTableHeadCellProps: {
          sx: {
            backgroundColor: '#1976d2',
            color: 'white',
            fontWeight: 'bold',
            left: 200,
            position: 'sticky',
            zIndex: 3,
          },
        },
        size: 80,
      },
      // Weekly grouped columns
      ...WEEKS.map((week) => ({
        columns: gameSchedule
          .filter((game) => game.startsWith(`${week}-`))
          .map((game) => {
            const [, awayTeam, , homeTeam] = game.split('-');
            const gameId = game.replace(
              /(\d+)-([^-]+)-vs-([^-]+)/,
              'w-$1-$2-vs-$3',
            );

            return {
              accessorKey: gameId,
              Cell: ({ cell }: { cell: MRT_Cell<TableRowData, unknown> }) => {
                const pick = cell.getValue() as string;
                const isCorrect =
                  seasonResults[gameId] && pick === seasonResults[gameId];
                const isUnplayedGame = seasonResults[gameId] === '-';

                return (
                  <Box
                    sx={{
                      alignItems: 'center',
                      backgroundColor: isUnplayedGame
                        ? 'white'
                        : isCorrect
                          ? PICKEM.COLOR_WINNER
                          : PICKEM.COLOR_LOSER,
                      color: isUnplayedGame ? 'black' : 'white',
                      display: 'flex',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      height: '100%',
                      justifyContent: 'center',
                      minHeight: '32px',
                      textAlign: 'center',
                      width: '100%',
                    }}
                  >
                    {pick}
                  </Box>
                );
              },
              enableColumnActions: false,
              enableSorting: false,
              header: `${awayTeam} @ ${homeTeam}`,
              muiTableBodyCellProps: {
                sx: {
                  borderLeft: '1px solid white',
                  padding: '0',
                },
              },
              muiTableHeadCellProps: {
                sx: {
                  backgroundColor: week % 2 === 0 ? '#f5f5f5' : '#fff',
                  fontSize: '0.75rem',
                  padding: '4px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                },
              },
              size: 90,
            };
          }),
        header: `Week ${week}`,
      })),
    ],
    [seasonResults],
  );

  // Define table data
  const tableData = useMemo<TableRowData[]>(() => {
    return Object.keys(userResults)
      .filter((key) => key !== 'results') // hide the 'results' row
      .map((key, index) => {
        const { correct, gamesPlayed } = calculateStats(
          userResults[key],
          seasonResults,
        );
        const row: TableRowData = {
          correct,
          gamesPlayed,
          id: index,
          user: key,
        };
        Object.keys(userResults[key]).forEach((gameId) => {
          row[gameId] = userResults[key][gameId];
        });
        return row;
      });
  }, [userResults, seasonResults]);

  return (
    <Page title="NFL Pick'em 2025">
      <Typography
        variant="h1"
        sx={{ margin: 'auto', mb: 4 }}
        aria-label="NFL Pick'em 2025 Results"
      >
        Results:{' '}
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
          NFL 2025 Pick&apos;em
        </Box>
      </Typography>
      <Box sx={{ height: 'auto', mx: 'auto', pb: 8 }}>
        {loading && <Typography>Loading QR codes...</Typography>}
        {error && (
          <Typography color="error" role="alert">
            {error}
          </Typography>
        )}
        {!loading && tableData.length > 0 && (
          <MaterialReactTable<TableRowData>
            columns={columns}
            data={tableData}
            enableColumnOrdering={false}
            enableGrouping={false}
            enableStickyHeader
            enableColumnResizing={false}
            enableDensityToggle={false}
            enableFullScreenToggle={true}
            enableHiding={false}
            enablePagination={false}
            enableBottomToolbar={false}
            enableTopToolbar={false}
            enableRowSelection={false}
            enableColumnActions={false}
            enableColumnFilters={false}
            enableGlobalFilter={false}
            enableSorting={false}
            muiTableContainerProps={{
              sx: {
                '&::-webkit-scrollbar': {
                  height: 8,
                  width: 8,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#1976d2',
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                },
                border: '1px solid #ddd',
                borderRadius: 1,
                maxHeight: '80vh',
                overflow: 'auto',
              },
            }}
            muiTableProps={{
              sx: {
                '& .MuiTableBody-root': {
                  '& .MuiTableRow-root:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                },
                '& .MuiTableCell-root': {
                  borderRight: '1px solid #ddd',
                  fontSize: '0.75rem',
                },
                '& .MuiTableHead-root': {
                  '& .MuiTableCell-root': {
                    backgroundColor: '#f5f5f5',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '8px 4px',
                  },
                },
              },
            }}
            initialState={{
              density: 'compact',
              sorting: [{ desc: true, id: 'correct' }],
            }}
          />
        )}
      </Box>
    </Page>
  );
}

export default Results;
