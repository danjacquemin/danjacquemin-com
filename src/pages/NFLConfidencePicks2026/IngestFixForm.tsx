import { Alert, Box, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import {
  sourceFileName,
  type IngestIssue,
  type SeasonSources,
  type SourceFile,
} from './ingest';

type IngestFixFormProps = {
  files: Partial<Record<SourceFile, IngestIssue[]>>;
  onChange: (sources: SeasonSources) => void;
  sources: SeasonSources;
};

function FileJsonField({
  file,
  issues,
  onParsed,
  value,
}: {
  file: SourceFile;
  issues: IngestIssue[];
  onParsed: (parsed: unknown) => void;
  value: unknown;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  return (
    <Box component="section" sx={{ mt: 3 }}>
      <Typography variant="h2" gutterBottom>
        {sourceFileName(file)}
      </Typography>
      <Typography component="p" sx={{ mb: 2 }}>
        Correct the issues below. This file will not drive the schedule until it
        parses.
      </Typography>
      <Box component="ul" sx={{ mb: 2, pl: 3 }}>
        {issues.map((issue) => (
          <Typography key={`${issue.path}:${issue.message}`} component="li">
            {issue.path}: {issue.message}
          </Typography>
        ))}
      </Box>
      <TextField
        label={`${sourceFileName(file)} contents`}
        value={text}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          try {
            onParsed(JSON.parse(next));
            setJsonError(null);
          } catch {
            setJsonError('Not valid JSON');
          }
        }}
        error
        fullWidth
        helperText={jsonError ?? 'The schedule stays hidden until this parses.'}
        minRows={16}
        multiline
        spellCheck={false}
        sx={{
          '& textarea': {
            fontFamily: '"Inconsolata", ui-monospace, monospace',
            fontSize: '0.875rem',
          },
        }}
      />
    </Box>
  );
}

function IngestFixForm({ files, onChange, sources }: IngestFixFormProps) {
  const fileEntries = Object.entries(files) as [SourceFile, IngestIssue[]][];

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Alert severity="warning">
        Some season files have fixable issues. The schedule is not shown until
        every file parses.
      </Alert>
      {fileEntries.map(([file, issues]) => (
        <FileJsonField
          key={file}
          file={file}
          issues={issues}
          value={sources[file]}
          onParsed={(parsed) =>
            onChange({
              ...sources,
              [file]: parsed,
            })
          }
        />
      ))}
    </Stack>
  );
}

export default IngestFixForm;
