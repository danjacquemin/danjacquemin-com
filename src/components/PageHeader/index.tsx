import { Box, Container, Typography } from '@mui/material';

function PageHeader() {
  return (
    <Container maxWidth="xl" disableGutters>
      <Box sx={{ p: 1 }} component="header">
        <Typography
          component="div"
          variant="body2"
          fontWeight="bold"
          noWrap
          align="right"
        >
          dan jacquemin . com
        </Typography>
      </Box>
    </Container>
  );
}

export default PageHeader;
