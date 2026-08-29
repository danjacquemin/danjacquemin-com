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
  helperText = 'The schedule stays hidden until this parses.',
  intro = 'Correct the issues below. This file will not drive the schedule until it parses.',
  issues,
  onParsed,
  value,
}: {
  file: SourceFile;
  helperText?: string;
  intro?: string;
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
        {intro}
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
        helperText={jsonError ?? helperText}
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

export function ResultsFixForm({
  issues,
  onChange,
  value,
}: {
  issues: IngestIssue[];
  onChange: (results: unknown) => void;
  value: unknown;
}) {
  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Alert severity="warning">
        The results file has fixable issues. Scores are not shown until it
        parses.
      </Alert>
      <FileJsonField
        file="results"
        helperText="Scores stay hidden until this parses."
        intro="Correct the issues below. This file will not drive scores until it parses."
        issues={issues}
        value={value}
        onParsed={onChange}
      />
    </Stack>
  );
}

type SeasonFile = Exclude<SourceFile, 'results'>;

function IngestFixForm({ files, onChange, sources }: IngestFixFormProps) {
  const fileEntries = (
    Object.entries(files) as [SourceFile, IngestIssue[]][]
  ).filter((entry): entry is [SeasonFile, IngestIssue[]] => {
    return entry[0] !== 'results';
  });

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
