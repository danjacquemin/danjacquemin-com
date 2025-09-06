import { Button, TextField, Box, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';

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
 * Page to generate and download QR code with user picks
 */
const CreateNFLQR2025 = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userPicks = (state as { userPicks?: UserPicks })?.userPicks || {};
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // full schedule size (272 games for 17 weeks, ~16 games/week)
  const FULL_SCHEDULE_SIZE = 272;
  const isScheduleComplete =
    Object.keys(userPicks).length >= FULL_SCHEDULE_SIZE;

  const qrData = () => {
    const picksArray = new Array(272).fill('');
    const keyRegex = /^w-(\d+)-(.+)-vs-(.+)$/; // userPicks uses w-Week-AwayTeam-vs-HomeTeam

    // if this is the special "results" email
    // update the picks array to be filled with '-' for all games
    if (email === 'results') {
      // fill picksArray with '-' for all games
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill#description
      // -- "The fill() method fills empty slots in sparse arrays with value as well."
      picksArray.fill('-');
    }

    for (const key in userPicks) {
      if (Object.prototype.hasOwnProperty.call(userPicks, key)) {
        const match = key.match(keyRegex);
        if (!match) {
          console.warn(`Invalid key format: ${key}`);
          continue;
        }
        const [, week, awayTeam, homeTeam] = match; // [key], week, awayTeam, homeTeam
        const gameID = `${week}-${awayTeam}-vs-${homeTeam}`; // convert to schedule format
        const index = gameSchedule.indexOf(gameID);
        if (index === -1) {
          console.warn(`Game ID ${gameID} not found in schedule`);
          continue;
        }
        const value =
          userPicks[key] === homeTeam
            ? '1'
            : userPicks[key] === awayTeam
              ? '0'
              : '-';
        if (!value) {
          console.warn(`Invalid value for key ${key}: ${userPicks[key]}`);
          continue;
        }
        picksArray[index] = value;
      }
    }
    return `${email};${picksArray.join('')}`; // include email in QR data
  };

  const downloadQR = () => {
    const svg = document.querySelector('svg');

    if (svg) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);

      // create a Blob from the SVG string
      const blob = new Blob([svgString], { type: 'image/svg+xml' });

      // create a download link
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `nfl-picks-${email.replace(/@/, '[at]')}-${dateStr}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();

      // clean up the URL object
      URL.revokeObjectURL(link.href);
    }
  };

  // Set initial email from localStorage if valid
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail && isValidEmail(storedEmail)) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <Page title="NFL Pick'em 2025" maxWidth="xl">
      <Typography variant="h1" sx={{ margin: 'auto', mb: 4 }}>
        QR Export:{' '}
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
          NFL 2025 Schedule
        </Box>
      </Typography>
      <Box maxWidth="sm" sx={{ mx: 'auto' }}>
        <Typography component="p" sx={{ mb: 4 }}>
          Make sure you&apos;ve picked all 272 games. Drop your email in the box
          and the &quot;Download&quot; button will do its dark sorcery. 🧙‍♂️✨
        </Typography>
        <TextField
          label="Email Address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          error={!!error}
          helperText={error}
          fullWidth
          sx={{ mb: 3 }}
          aria-label="Enter email for QR code"
          autoComplete="new-password"
        />
        <Box sx={{ mb: 3, p: 4, textAlign: 'center' }}>
          <QRCodeSVG
            value={`danjacquemin.com/nfl/read-qr?data=` + qrData()}
            size={300}
            aria-label="QR code containing user picks"
            // onClick={downloadQR}
            // style={{ cursor: 'pointer' }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/nfl')}
            aria-label="Return to main page"
          >
            Back
          </Button>{' '}
          <Button
            variant="contained"
            onClick={downloadQR}
            disabled={
              !(
                email === 'results' ||
                (isScheduleComplete && isValidEmail(email))
              )
            }
            aria-label="Download QR code as image"
          >
            Download QR Code
          </Button>
        </Box>
        <Typography component="p" sx={{ mb: 4 }}>
          Once you have your QR code, fire your email client and send the QR!
        </Typography>
        <Box sx={{ mb: 3, p: 4, textAlign: 'center' }}>
          <Typography
            component="p"
            sx={{
              '&:hover': {
                opacity: 1,
              },
              opacity: 0.1,
              transition: 'opacity 0.2s',
              wordBreak: 'break-all',
            }}
            fontSize={'0.875rem'}
          >
            <Link
              to={`/nfl/read-qr?data=${qrData()}`}
              rel="noopener noreferrer"
              aria-label="Link to import QR code"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              danjacquemin.com/nfl/read-qr?data={qrData()}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Page>
  );
};

export default CreateNFLQR2025;
