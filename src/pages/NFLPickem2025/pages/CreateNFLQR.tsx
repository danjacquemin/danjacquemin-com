import { Button, TextField, Box, Typography } from '@mui/material';
import pako from 'pako';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import type { UserPicks } from '../types';

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
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return '';
    }
    const optimizedPicks: { [key: string]: string } = {};
    const keyRegex = /^w-(\d+)-(.+)-vs-(.+)$/; // Matches w-<week>-<homeTeam>-vs-<awayTeam>
    for (const key in userPicks) {
      if (Object.prototype.hasOwnProperty.call(userPicks, key)) {
        const match = key.match(keyRegex);
        if (!match) {
          console.warn(`Invalid key format: ${key}`);
          continue;
        }
        const [, week, homeTeam, awayTeam] = match;
        const finalKey = `${week}-${homeTeam}-${awayTeam}`;
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
        optimizedPicks[finalKey] = value;
      }
    }
    const data = {
      dateCreated: new Date().toISOString(),
      email,
      userPicks: optimizedPicks,
    };
    const compressed = pako.gzip(JSON.stringify(data));
    return `danjacqumein.com/nfl/read-qr?picks=${encodeURIComponent(
      btoa(String.fromCharCode(...compressed)),
    )}`;
  };

  const downloadQR = () => {
    const svg = document.querySelector('svg');

    if (svg) {
      // Serialize SVG to string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);

      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          const link = document.createElement('a');
          link.download = `nfl-picks-${email}-${new Date().toISOString().split('T')[0]}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
      }
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
              size={400}
              aria-label="QR code containing user picks and email"
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
