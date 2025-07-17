import jsQR from 'jsqr';
import { Button, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import { useState, useEffect } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import CircularProgress from '@mui/material/CircularProgress';

import type { UserPicks } from '../types';

import gameSchedule from '../data/NFLScheduleOfGames.json';
import Page from '../../../templates/Page';

/**
 * Validates email address
 */
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const FULL_SCHEDULE_SIZE = 272;

/**
 * Page to import user picks from QR code URL
 */
const ReadNFLQR2025 = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | boolean | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // handle query data
  const queryData = searchParams.get('data');
  const processQueryData = (data?: string) => {
    const inputData = data || queryData; // Use qrData if provided, else queryData

    if (!inputData) {
      setError('No data provided in URL.');
      return;
    }

    try {
      const [emailPart = '', picksPart] = inputData.split(';');
      if (!picksPart) throw new Error('No picks data provided.');

      const [, email] = emailPart.split('=');
      const picks = picksPart.trim();

      if (picks.length !== FULL_SCHEDULE_SIZE) {
        console.error(
          `Expected ${FULL_SCHEDULE_SIZE} picks, got ${picks.length}.`,
        );

        if (email !== 'dhj') {
          throw new Error(
            `Expected ${FULL_SCHEDULE_SIZE} picks, got ${picks.length}.`,
          );
        }

        setError(true);
      }

      if (!/^[01]*$/.test(picks)) {
        console.error('Picks must contain only 0s and 1s.');
        throw new Error('Picks must contain only 0s and 1s.');
        setError(true);
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

      // save valid email to localStorage if present and valid
      if (email && isValidEmail(email)) {
        localStorage.setItem('userEmail', email);
      }

      localStorage.setItem('nflPicks2025', JSON.stringify(userPicks));
      setError(false);
      // navigate('/nfl', { state: { userPicks } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing data.');
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setQrData('No file selected.');
      return;
    }

    setLoading(true); // start loading

    // The setTimeout hack forces a render cycle after setting loading to true,
    // giving the spinner a chance to display before the heavy image processing blocks the thread.
    // This prevents the premature setLoading(false) from hiding it.
    await new Promise((resolve) => setTimeout(resolve, 0)); // force render cycle

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setQrData('Could not get canvas context.');
          setLoading(false); // end loading on error
          return;
        }
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        setQrData(code ? code.data : 'No QR code found in the image.');
        setLoading(false); // end loading on completion
      };
      img.onerror = () => {
        setQrData('Error loading image.');
        setLoading(false); // end loading on error
      };
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      } else {
        setQrData('Could not read image file.');
        setLoading(false); // end loading on error
      }
    };
    reader.onerror = () => {
      setQrData('Error reading file.');
      setLoading(false); // end loading on error
    };
    reader.readAsDataURL(file);
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

  // process QR data when available
  useEffect(() => {
    if (qrData) {
      processQueryData(qrData); // Pass qrData to processQueryData
    }
  }, [qrData, processQueryData]);

  return (
    <Page title="NFL Pick'em 2025" maxWidth="xl">
      <Typography variant="h1" sx={{ margin: 'auto', mb: 4 }}>
        QR Import:{' '}
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
          NFL 2025 Schedule
        </Box>
      </Typography>
      <Box maxWidth="sm" sx={{ mx: 'auto', pb: 8 }}>
        <Box component={'div'} sx={{}}>
          {!loading && error === null && (
            <>
              <Typography component="p" sx={{ mb: 2 }}>
                Import your picks:
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </>
          )}
          {loading ? (
            <Box component={'p'}>
              <CircularProgress size={16} color="inherit" />{' '}
              <b>Processing Image&hellip;</b>
            </Box>
          ) : qrData ? (
            <Box
              component={'p'}
              sx={{
                wordBreak: 'break-all',
              }}
            >
              <Box component="span" sx={{ fontWeight: 'bold', mb: 2 }}>
                Image Data:
              </Box>{' '}
              <Box component="span" sx={{ fontStyle: 'italic' }}>
                {qrData}
              </Box>
            </Box>
          ) : null}
        </Box>

        {error === false && (
          <Box component="div" sx={{ color: theme.palette.success.main }}>
            <p>
              <b>Success!</b> Your picks have been imported.
            </p>
            <Button
              variant="outlined"
              onClick={error ? handleNavigateOnError : () => navigate('/nfl')}
              aria-label="Return to main page"
            >
              View Picks
            </Button>
          </Box>
        )}

        {error && (
          <>
            <Box component="div" sx={{ color: theme.palette.error.main }}>
              <p>
                <b>Import Failed!</b> The QR code data is invalid or incomplete.
              </p>
              <p>Try again. </p>
            </Box>
            <Button
              variant="outlined"
              onClick={error ? handleNavigateOnError : () => navigate('/nfl')}
              aria-label="Return to main page"
            >
              Return to Pick&lsquo;em
            </Button>
          </>
        )}
      </Box>
    </Page>
  );
};

export default ReadNFLQR2025;
