import jsQR from 'jsqr';
import { MaterialReactTable } from 'material-react-table';
import { Box, Typography } from '@mui/material';
import { useState, useEffect, useMemo, useRef } from 'react';

import type { UserPicks, TableRowData } from '../types';

import CorrectPerWeek from '../components/CorrectPerWeek';
import { PICKEM } from '../consts';
import gameSchedule from '../data/NFLScheduleOfGames.json';
import Page from '../../../templates/Page';

import type { MRT_ColumnDef, MRT_Cell } from 'material-react-table';

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

const RESULTS_SVG = 'results/nfl-picks-results-2025-10-21.svg';
const CURRENT_WEEK = 7; // 1-18

const SHOW_RESULTS = true;
const FULL_SCHEDULE_SIZE = 272;
const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

const commonCellStyles = {
  padding: `0`,
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

// processes QR code SVG data to extract user picks
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

  // refs for scrolling to current week
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const weekRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  // calculate games played and correct picks
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

  // show or hide results
  // used before the season when there are no results
  useEffect(() => {
    if (SHOW_RESULTS) {
      if (!qrFiles.includes(RESULTS_SVG)) {
        qrFiles.push(RESULTS_SVG);
      }
    }
  }, []);

  // load and process the qr codes
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

      // sort keys so the "results" players appears first
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

  // auto-scroll to current week after data loads
  useEffect(() => {
    if (!loading && Object.keys(userResults).length > 0) {
      const currentWeek = CURRENT_WEEK;
      const targetRef = weekRefs.current[currentWeek];
      const tableContainer = tableContainerRef.current;

      if (targetRef && tableContainer) {
        // small delay to ensure table is fully rendered
        setTimeout(() => {
          const targetRect = targetRef.getBoundingClientRect();
          const containerRect = tableContainer.getBoundingClientRect();
          // scroll to the current week in the container
          const currentScrollLeft = tableContainer.scrollLeft;
          // target position
          const stickyColumnsWidth = 280; // 200 (user) + 80 (correct)
          const desiredOffsetFromLeft = stickyColumnsWidth + 5;
          // where the target element is relative to the container
          const targetOffsetFromContainer =
            targetRect.left - containerRect.left + currentScrollLeft;
          const newScrollLeft =
            targetOffsetFromContainer - desiredOffsetFromLeft;
          // you go scroll now!
          tableContainer.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth',
          });
        }, 100);
      }
    }
  }, [loading, userResults]);

  const columns = useMemo<MRT_ColumnDef<TableRowData>[]>(
    () => [
      // user column (sticky)
      {
        accessorKey: 'user',
        size: 200,
        enableSorting: false, // overrides initialState
        header: '',
        muiTableHeadCellProps: {
          sx: {
            ...commonHeaderCellStyles,
            position: 'sticky', // fixes the columns header
            left: 0, // to the left
            zIndex: 2, // and on top of other cells while scrolling
            paddingLeft: '0.2rem',
          },
        },
        Cell: ({ cell }: { cell: MRT_Cell<TableRowData, unknown> }) => {
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
            paddingLeft: '0.2rem',
          },
        },
      },
      // correct picks column (sticky)
      {
        accessorKey: 'correct',
        size: 80,
        header: 'Correct',
        muiTableHeadCellProps: {
          sx: {
            ...commonHeaderCellStyles,
            position: 'sticky', // fixes the columns header
            left: 200, // to the right of the user column
            zIndex: 2, // and on top of other cells while scrolling
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
        Cell: ({ cell }: { cell: MRT_Cell<TableRowData, unknown> }) => {
          const correctValue = cell.getValue() as number;
          return <Box sx={{ textAlign: 'center' }}>{correctValue}</Box>;
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
      // Weekly grouped columns
      ...WEEKS.map((week) => ({
        columns: gameSchedule
          .filter((game) => game.startsWith(`${week}-`))
          .map((game, gameIndex) => {
            const [, awayTeam, , homeTeam] = game.split('-');
            const gameId = game.replace(
              /(\d+)-([^-]+)-vs-([^-]+)/,
              'w-$1-$2-vs-$3',
            );

            return {
              accessorKey: gameId,
              size: 90,
              enableSorting: false, // overrides initialState
              header: `${awayTeam} @ ${homeTeam}`,
              muiTableHeadCellProps: {
                sx: {
                  ...commonHeaderCellStyles,
                  fontSize: '0.75rem',
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
                // ref on the first game column of each week
                ...(gameIndex === 0 && {
                  ref: (el: HTMLElement | null) => {
                    weekRefs.current[week] = el;
                  },
                }),
              },
              Cell: ({ cell }: { cell: MRT_Cell<TableRowData, unknown> }) => {
                const pick = cell.getValue() as string;
                const isCorrect =
                  seasonResults[gameId] && pick === seasonResults[gameId];
                const isUnplayedGame = seasonResults[gameId] === '-';

                return (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '1px',
                      width: '100%',
                      height: '100%',
                      minHeight: '32px',
                      color: isUnplayedGame ? 'black' : 'white',
                      backgroundColor: isUnplayedGame
                        ? 'white'
                        : isCorrect
                          ? PICKEM.COLOR_WINNER
                          : PICKEM.COLOR_LOSER,
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                    }}
                  >
                    {pick}
                  </Box>
                );
              },
              muiTableBodyCellProps: {
                sx: {
                  ...commonBodyCellStyles,
                },
              },
            };
          }),
        header: `Week ${week}`,
        muiTableHeadCellProps: {
          sx: {
            ...commonHeaderCellStyles,
            '& .Mui-TableHeadCell-Content-Labels': {
              flexBasis: '100%',
              paddingLeft: '1em',
            },
            '& .Mui-TableHeadCell-Content-Wrapper': {},
          },
        },
        muiTableBodyCellProps: {
          sx: {
            ...commonBodyCellStyles,
          },
        },
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
          <>
            <CorrectPerWeek
              userResults={userResults}
              seasonResults={seasonResults}
            />

            <Box sx={{ mt: 8 }}>
              <Typography variant="h2" sx={{ mb: 2 }}>
                Individual Games
              </Typography>
              <MaterialReactTable<TableRowData>
                columns={columns}
                data={tableData}
                initialState={{
                  density: 'compact',
                  sorting: [{ desc: true, id: 'correct' }],
                }}
                enableHiding={false}
                enableTopToolbar={false}
                enableBottomToolbar={false}
                enableColumnActions={false}
                enableSorting={true}
                muiTableContainerProps={{
                  ref: tableContainerRef,
                }}
                muiTablePaperProps={{ elevation: 0, sx: { border: 0 } }}
                muiTableHeadRowProps={{ sx: { boxShadow: 0, border: 0 } }}
              />
            </Box>
          </>
        )}
      </Box>
    </Page>
  );
}

export default Results;
