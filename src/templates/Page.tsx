import Box from '@mui/material/Box';

import { useUpdateDocumentTitle } from '../hooks/useUpdateDocumentTitle';

import type { ReactNode } from 'react';

type PageProps = {
  title?: string;
  children: ReactNode;
};

function Page({ children, title }: PageProps) {
  useUpdateDocumentTitle(title);

  return (
    <Box sx={{ p: 2 }} component="main">
      {children}
    </Box>
  );
}

export default Page;
