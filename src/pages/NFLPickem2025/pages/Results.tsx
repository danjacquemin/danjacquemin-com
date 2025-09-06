import jsQR from 'jsqr';
import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

import type { UserPicks } from '../types';

import { PICKEM } from '../consts';
import gameSchedule from '../data/NFLScheduleOfGames.json';
import { StyledDataGrid } from '../nflPickem2025.styled';
import Page from '../../../templates/Page';

import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

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
const RESULTS_SVG = 'nfl-picks-results-2025-09-06.svg';
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

  // Define DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: 'User',
      renderCell: (params) => {
        const [user] = params.value.split('@');
        return (
          <Typography sx={{ padding: '1rem' }}>{user.toLowerCase()}</Typography>
        );
      },
      width: 250,
    },
    {
      align: 'center',
      field: 'correct',
      headerAlign: 'center',
      headerName: 'Correct',
      renderCell: (params) => params.value,
      width: 100,
    },
    ...gameSchedule.map((game) => {
      const [, awayTeam, , homeTeam] = game.split('-');
      const gameId = game.replace(/(\d+)-([^-]+)-vs-([^-]+)/, 'w-$1-$2-vs-$3');
      return {
        align: 'center',
        field: gameId,
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams) => {
          const pick = params.value;
          const isCorrect =
            seasonResults[gameId] && pick === seasonResults[gameId];
          const isUnplayedGame = seasonResults[gameId] === '-' ? true : false;
          return (
            <Typography
              component="span"
              sx={{
                alignItems: 'center',
                backgroundColor: isUnplayedGame
                  ? 'white'
                  : isCorrect
                    ? PICKEM.COLOR_WINNER
                    : PICKEM.COLOR_LOSER,
                color: isUnplayedGame ? 'black' : 'white',
                display: 'flex',
                fontSize: `0.75rem`,
                fontWeight: '500',
                height: '100%',
                justifyContent: 'center',
                textAlign: 'center',
                width: '100%',
              }}
            >
              {pick}
            </Typography>
          );
        },
        renderHeader: () => (
          <Typography
            component="span"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {awayTeam} @ {homeTeam}
          </Typography>
        ),
        width: 90,
      } as GridColDef;
    }),
  ];

  // Group columns by week for header grouping
  const groupedColumns = WEEKS.map((week) => ({
    children: columns
      .filter((col) => col.field.startsWith(`w-${week}-`))
      .map((col) => ({ field: col.field })),
    groupId: `week-${week}`,
    headerName: `Week ${week}`,
  }));

  // Define DataGrid rows
  const rows = Object.keys(userResults)
    .filter((key) => key !== 'results') // hide the 'results' row
    .map((key, index) => {
      const { correct, gamesPlayed } = calculateStats(
        userResults[key],
        seasonResults,
      );
      const row: { [key: string]: string | number } = {
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

  return (
    <Page title="NFL Pick'em 2025">
      <Typography
        variant="h1"
        sx={{ margin: 'auto', mb: 4 }}
        aria-label="NFL Pick'em 2025 Results"
      >
        Results:{' '}
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
          NFL 2025 Pick’em
        </Box>
      </Typography>
      <Box sx={{ height: 'auto', mx: 'auto', pb: 8 }}>
        {loading && <Typography>Loading QR codes...</Typography>}
        {error && (
          <Typography color="error" role="alert">
            {error}
          </Typography>
        )}
        {!loading && rows.length > 0 && (
          <StyledDataGrid
            hideFooter
            rows={rows}
            columns={columns}
            columnGroupingModel={groupedColumns}
            aria-label="NFL Pick'em Results Grid"
            disableColumnSorting={false}
            disableColumnMenu={true}
            disableRowSelectionOnClick
          />
        )}
      </Box>
    </Page>
  );
}

export default Results;
