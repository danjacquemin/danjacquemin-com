import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { useUpdateDocumentTitle } from '../hooks/useUpdateDocumentTitle';

import type { ReactNode } from 'react';

type PageProps = {
  title?: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
};

function Page({ children, maxWidth = 'xl', title }: PageProps) {
  useUpdateDocumentTitle(title);

  return (
    <Container
      maxWidth={maxWidth}
      disableGutters
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        p: 1,
      }}
    >
      <Box sx={{ p: 2 }} component="main">
        {children}
      </Box>
    </Container>
  );
}

export default Page;
