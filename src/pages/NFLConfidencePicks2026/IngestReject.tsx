import { Alert, Box, Typography } from '@mui/material';

import { sourceFileName, type IngestIssue, type SourceFile } from './ingest';

type IngestRejectProps = {
  files: Partial<Record<SourceFile, IngestIssue[]>>;
};

function IngestReject({ files }: IngestRejectProps) {
  return (
    <Alert severity="error" sx={{ mt: 2 }}>
      <Typography component="p" gutterBottom>
        This season data cannot be used. The pool is not shown.
      </Typography>
      {(Object.entries(files) as [SourceFile, IngestIssue[]][]).map(
        ([file, issues]) => (
          <Box key={file} sx={{ mt: 2 }}>
            <Typography component="p" fontWeight={600}>
              {sourceFileName(file)}
            </Typography>
            <Box component="ul" sx={{ mb: 0, mt: 1, pl: 3 }}>
              {issues.map((issue) => (
                <Typography
                  key={`${issue.path}:${issue.message}`}
                  component="li"
                >
                  {issue.path}: {issue.message}
                </Typography>
              ))}
            </Box>
          </Box>
        ),
      )}
    </Alert>
  );
}

export default IngestReject;
