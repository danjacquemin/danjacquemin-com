import { Button, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import { useState, useEffect } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import type { UserPicks } from '../types';

import gameSchedule from '../data/NFLScheduleOfGames.json';
import Page from '../../../templates/Page';

/**
 * Validates email address
 */
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Page to import user picks from QR code URL
 */
const ReadNFLQR2025 = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const FULL_SCHEDULE_SIZE = 272;

  // handle query data
  const queryData = searchParams.get('data');
  const processQueryData = () => {
    if (!queryData) {
      setError('No data provided in URL.');
      return;
    }

    try {
      const [emailPart = '', picksPart] = queryData.split(';');
      if (!picksPart) throw new Error('No picks data provided.');

      const email = emailPart.trim();
      const picks = picksPart.trim();

      if (picks.length !== FULL_SCHEDULE_SIZE) {
        throw new Error(
          `Expected ${FULL_SCHEDULE_SIZE} picks, got ${picks.length}.`,
        );
      }

      if (!/^[01]*$/.test(picks)) {
        throw new Error('Picks must contain only 0s and 1s.');
      }

      const userPicks: UserPicks = {};
      picks.split('').forEach((pick, index) => {
        if (pick) {
          const gameID = gameSchedule[index];
          const [week, awayTeam, , homeTeam] = gameID.split('-'); // week, away team, [vs], home team
          const key = `w-${week}-${awayTeam}-vs-${homeTeam}`;
          userPicks[key] = pick === '1' ? homeTeam : awayTeam; // 0 means pick for away team, 1 means pick for home team
        }
      });

      // Save valid email to localStorage if present and valid
      if (email && isValidEmail(email)) {
        localStorage.setItem('userEmail', email);
      }

      localStorage.setItem('nflPicks2025', JSON.stringify(userPicks));
      // navigate('/nfl', { state: { userPicks } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing data.');
    }
  };

  const handleNavigateOnError = () => {
    localStorage.removeItem('nflPicks2025');
    localStorage.removeItem('userEmail');
    navigate('/nfl');
  };

  // process query data on mount (if available)
  useEffect(() => {
    if (queryData) {
      processQueryData();
    }
  }, [queryData]);

  return (
    <Page title="NFL Pick'em 2025" maxWidth="xl">
      <Typography variant="h1" sx={{ margin: 'auto', mb: 4 }}>
        QR Import:{' '}
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
          NFL 2025 Schedule
        </Box>
      </Typography>
      <Box maxWidth="sm" sx={{ mx: 'auto' }}>
        <Typography component="p" sx={{ mb: 2 }}>
          Import your picks: <code>/nfl/read-qr?data=&hellip;</code>
        </Typography>
        {error && (
          <Typography
            color="error"
            sx={{
              border: '1px solid red',
              fontWeight: 'bold',
              mb: 3,
              p: 2,
              textAlign: 'center',
            }}
            role="alert"
            component={'p'}
          >
            {error}
          </Typography>
        )}
        {!error && (
          <Typography
            sx={{
              border: `1px solid ${theme.palette.primary.main}`,
              fontWeight: 'bold',
              mb: 3,
              p: 2,
              textAlign: 'center',
            }}
            role="alert"
            component={'p'}
          >
            Successfully imported your picks!
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8 }}>
          <Button
            variant="outlined"
            onClick={error ? handleNavigateOnError : () => navigate('/nfl')}
            aria-label="Return to main page"
          >
            {error ? `Return to Pick'em` : `View Picks`}
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default ReadNFLQR2025;
