import { Button, TextField, Box, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

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

  // Full schedule size (272 games for 17 weeks, ~16 games/week)
  const FULL_SCHEDULE_SIZE = 272;
  const isScheduleComplete =
    Object.keys(userPicks).length >= FULL_SCHEDULE_SIZE;

  const qrData = () => {
    const picksArray = new Array(272).fill('');
    const keyRegex = /^w-(\d+)-(.+)-vs-(.+)$/; // userPicks uses w-Week-HomeTeam-vs-AwayTeam

    for (const key in userPicks) {
      if (Object.prototype.hasOwnProperty.call(userPicks, key)) {
        const match = key.match(keyRegex);
        if (!match) {
          console.warn(`Invalid key format: ${key}`);
          continue;
        }
        const [, week, homeTeam, awayTeam] = match;
        const gameID = `${week}-${awayTeam}-vs-${homeTeam}`; // Convert to schedule format
        const index = gameSchedule.indexOf(gameID);
        if (index === -1) {
          console.warn(`Game ID ${gameID} not found in schedule`);
          continue;
        }
        const value =
          userPicks[key] === homeTeam
            ? '0'
            : userPicks[key] === awayTeam
              ? '1'
              : '';
        if (!value) {
          console.warn(`Invalid value for key ${key}: ${userPicks[key]}`);
          continue;
        }
        picksArray[index] = value;
      }
    }

    console.log(`picksArray:`, picksArray.join(''));
    return `${email};${picksArray.join('')}`; // Include email in QR data
  };

  const downloadQR = () => {
    const svg = document.querySelector('svg');

    if (svg) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);

      // Create a Blob from the SVG string
      const blob = new Blob([svgString], { type: 'image/svg+xml' });

      // Create a download link
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `nfl-picks-${email}-${dateStr}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();

      // Clean up the URL object
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <Page title="NFL Pick'em 2025" maxWidth="xl">
      <Typography variant="h1" sx={{ margin: 'auto', mb: 4 }}>
        QR Export:{' '}
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
          NFL 2025 Schedule
        </Box>
      </Typography>
      <Box maxWidth="sm" sx={{ mx: 'auto' }}>
        <Typography component="p" sx={{ mb: 2 }}>
          Enter your email to include it in the QR code with your picks.
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
          aria-describedby={isScheduleComplete ? undefined : 'schedule-warning'}
        />
        {isScheduleComplete && email && isValidEmail(email) ? (
          <Box sx={{ mb: 3, p: 4, textAlign: 'center' }}>
            <Typography
              component="p"
              display="block"
              sx={{ mb: 2 }}
              fontSize={'0.875rem'}
            >
              Save this QR code.
              <br />
              It can be used to import your picks
            </Typography>
            <QRCodeSVG
              value={qrData()}
              size={300}
              aria-label="QR code containing user picks"
            />
          </Box>
        ) : !isScheduleComplete && email && isValidEmail(email) ? (
          <Typography
            id="schedule-warning"
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
            You didn&rsquo;t pick all {FULL_SCHEDULE_SIZE} games. Go Back. Try
            harder!
          </Typography>
        ) : null}
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
            disabled={!isScheduleComplete || !isValidEmail(email)}
            aria-label="Download QR code as image"
          >
            Download QR Code
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default CreateNFLQR2025;
