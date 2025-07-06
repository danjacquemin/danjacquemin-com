import { Box, Container, Typography, List, ListItem } from '@mui/material';

import { Link } from 'react-router-dom';

function PageHeader() {
  return (
    <Container maxWidth="xl" disableGutters>
      <Box
        component="header"
        sx={{ borderBottom: '1px solid black', p: 1 }}
        aria-label="Site header"
      >
        <Box
          component="div"
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Link to="/" aria-label="back to the home page" className="nav-link">
            <Typography
              fontWeight="500"
              fontSize="body2.fontSize"
              noWrap
              align="right"
            >
              dan jacquemin . com
            </Typography>
          </Link>
        </Box>
        <Box
          component="nav"
          aria-label="main navigation"
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <List
            sx={{
              display: 'flex',
              flexDirection: 'row',
              margin: 0,
              padding: 0,
            }}
          >
            <ListItem sx={{ padding: 0, width: 'auto' }}>
              <Link
                to="/about"
                aria-label="navigate to about page"
                className="nav-link"
              >
                <Typography
                  fontWeight="500"
                  fontSize="body2.fontSize"
                  noWrap
                  align="right"
                >
                  about
                </Typography>
              </Link>
            </ListItem>
          </List>
        </Box>
      </Box>
    </Container>
  );
}

export default PageHeader;
