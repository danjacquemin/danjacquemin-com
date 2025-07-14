import jsqr from 'jsqr';
import { Button, Box, Typography } from '@mui/material';
import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

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
 * Page to upload and process QR code SVG to import user picks
 */
const ReadNFLQR2025 = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const FULL_SCHEDULE_SIZE = 272;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'image/svg+xml') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please upload a valid SVG file.');
    }
  };

  const processQR = async () => {
    if (!file) {
      setError('No file selected.');
      return;
    }

    try {
      // Read SVG file as text
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) throw new Error('Invalid SVG content.');

      // Convert SVG to canvas for QR decoding
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable.');

      // Set canvas size based on SVG viewBox or default to 300x300
      const viewBox = svg.getAttribute('viewBox')?.split(' ');
      canvas.width = viewBox ? parseInt(viewBox[2]) || 300 : 300;
      canvas.height = viewBox ? parseInt(viewBox[3]) || 300 : 300;

      // Render SVG to canvas (using a temporary image)
      const img = new Image();
      img.src = `data:image/svg+xml;base64,${btoa(text)}`;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      ctx.drawImage(img, 0, 0);

      // Decode QR code from canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsqr(imageData.data, canvas.width, canvas.height);
      if (!code) throw new Error('No QR code detected in the image.');

      const qrData = code.data;
      const [emailPart, picksPart] = qrData.split(';');
      if (!emailPart || !picksPart) throw new Error('Invalid QR data format.');

      const email = emailPart.trim();
      if (!isValidEmail(email)) throw new Error('Invalid email in QR code.');

      const picks = picksPart.trim();
      if (picks.length !== FULL_SCHEDULE_SIZE) {
        throw new Error(
          `Expected ${FULL_SCHEDULE_SIZE} picks, got ${picks.length}.`,
        );
      }

      // Validate picks (each char should be '0', '1', or '')
      if (!/^[01]*$/.test(picks.replace(/"/g, ''))) {
        throw new Error('Invalid picks data in QR code.');
      }

      // Transform picks into userPicks
      const userPicks: UserPicks = {};
      picks.split('').forEach((pick, index) => {
        if (pick) {
          const gameID = gameSchedule[index];
          const [week, awayTeam, homeTeam] = gameID.split('-');
          const key = `w-${week}-${homeTeam}-vs-${awayTeam}`; // Convert to userPicks format
          userPicks[key] = pick === '0' ? homeTeam : awayTeam;
        }
      });

      // Store in localStorage
      localStorage.setItem('nflPicks2025', JSON.stringify(userPicks));

      // Redirect to /nfl with userPicks in state
      navigate('/nfl', { state: { userPicks } });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error processing QR code.',
      );
    }
  };

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
          Upload the SVG QR code containing your picks.
        </Typography>
        <Box sx={{ mb: 3 }}>
          <input
            type="file"
            accept="image/svg+xml"
            onChange={handleFileChange}
            aria-label="Upload SVG QR code"
          />
        </Box>
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
            onClick={processQR}
            disabled={!file}
            aria-label="Process uploaded QR code"
          >
            Import Picks
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default ReadNFLQR2025;
