import jsQR from 'jsqr';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';

import { formatClosesAt, isValidEmail } from './week';

import type { ChangeEvent } from 'react';

type WeekRailProps = {
  canExport: boolean;
  canReset: boolean;
  closesAt: Date | null;
  email: string;
  frozen: boolean;
  n: number;
  onDownload: (svg: SVGSVGElement) => void;
  onEmailChange: (email: string) => void;
  onReset: () => void;
  onUploadFile: (file: File) => Promise<void>;
  payload: string;
  picked: number;
  resultsPosted: boolean;
  score: { correct: number; points: number } | null;
  uploadError: string | null;
  weekNumber: number;
};

function WeekRail({
  canExport,
  canReset,
  closesAt,
  email,
  frozen,
  n,
  onDownload,
  onEmailChange,
  onReset,
  onUploadFile,
  payload,
  picked,
  resultsPosted,
  score,
  uploadError,
  weekNumber,
}: WeekRailProps) {
  const qrRef = useRef<SVGSVGElement>(null);
  const [uploading, setUploading] = useState(false);
  const trimmedEmail = email.trim();
  const emailOk = isValidEmail(trimmedEmail);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      await onUploadFile(file);
    } finally {
      setUploading(false);
    }
  }

  function handleDownload() {
    const svg = qrRef.current;
    if (!svg) return;
    onDownload(svg);
  }

  const uploadControl = (
    <>
      <Button
        variant="outlined"
        component="label"
        disabled={uploading}
        aria-label="Upload week QR"
      >
        {uploading ? 'Reading QR…' : 'Upload QR'}
        <input
          hidden
          type="file"
          accept="image/svg+xml,image/png,image/jpeg,image/*"
          onChange={handleUpload}
        />
      </Button>
      {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
    </>
  );

  return (
    <Box
      component="aside"
      sx={{
        alignSelf: { md: 'flex-start' },
        display: 'flex',
        flex: { md: '1 1 0' },
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
        position: { md: 'sticky' },
        top: { md: 16 },
        width: { md: 'auto', xs: '100%' },
      }}
    >
      {frozen ? (
        <>
          {picked === 0 ? (
            <Alert severity="info">
              This week is closed. No picks on this device. Upload a week QR to
              restore your card.
            </Alert>
          ) : null}
          {score ? (
            <>
              <Typography component="p">{score.correct} right</Typography>
              <Typography component="p">{score.points} points</Typography>
            </>
          ) : null}
          {!score && !resultsPosted ? (
            <Typography component="p">Results not posted yet</Typography>
          ) : null}
          {!score && resultsPosted && picked > 0 ? (
            <Typography component="p" color="text.secondary">
              No complete card on this device.
            </Typography>
          ) : null}
        </>
      ) : (
        <>
          <Typography component="p" aria-live="polite">
            {picked} of {n}
          </Typography>
          {closesAt ? (
            <Typography component="p" color="text.secondary">
              Closes {formatClosesAt(closesAt)}
            </Typography>
          ) : null}
          <TextField
            label="Email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            error={trimmedEmail.length > 0 && !emailOk}
            helperText={
              trimmedEmail.length > 0 && !emailOk
                ? 'Enter a valid email'
                : 'Used on the week QR so picks can be told apart'
            }
            autoComplete="email"
            fullWidth
          />
          <Button
            variant="contained"
            disabled={!canExport}
            onClick={handleDownload}
            aria-label="Download week QR code"
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              py: 2,
              textTransform: 'none',
            }}
          >
            {canExport ? (
              <QRCodeSVG
                ref={qrRef}
                value={payload}
                size={256}
                title="Week pick QR"
                style={{ height: 128, pointerEvents: 'none', width: 128 }}
              />
            ) : null}
            Download QR
          </Button>
          {!canExport ? (
            <Typography
              component="p"
              color="text.secondary"
              fontSize="0.875rem"
            >
              {picked < n
                ? 'Pick a winner for every game to export.'
                : 'Enter a valid email to export.'}
            </Typography>
          ) : null}
        </>
      )}
      {uploadControl}
      {frozen ? null : (
        <Button
          variant="outlined"
          size="small"
          disabled={!canReset}
          onClick={onReset}
          aria-label={`Reset picks for week ${weekNumber}`}
          sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
        >
          Reset Week {weekNumber}
        </Button>
      )}
    </Box>
  );
}

export async function decodeQrImageFile(file: File): Promise<string | null> {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const width = image.naturalWidth || image.width || 1024;
  const height = image.naturalHeight || image.height || 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width < 32 ? 1024 : width;
  canvas.height = height < 32 ? 1024 : height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  return code?.data ?? null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read file'));
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load image'));
    image.src = src;
  });
}

export default WeekRail;
