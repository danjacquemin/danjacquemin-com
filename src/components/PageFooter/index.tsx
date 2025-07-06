import { GitHub, Twitter, LinkedIn, Instagram } from '@mui/icons-material';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// -- -- -- -- --

const socialMedia = [
  {
    icon: LinkedIn,
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/dan-jacquemin/',
  },
  {
    icon: GitHub,
    name: 'GitHub',
    url: 'https://github.com/danjacquemin',
  },
  {
    icon: Twitter,
    name: 'Twitter',
    url: 'https://twitter.com/danjacquemin/',
  },
  {
    icon: Instagram,
    name: 'Instagram',
    url: 'https://www.instagram.com/djacquemin/',
  },
];

const reminders = [
  'Cape <i>does not</i> enable flight.',
  'Call your mom.',
  '2 oz white rum, ¾ oz lime juice, ¾ oz 1:1 simple syrup, <i>tiny</i> pinch of salt. Combine. Shake. Strain. Serve with a half slice of lime.',
  'Stand up straight with your shoulders back.',
  'Ég tala ekki íslensku.',
  'Remember compliments you receive, forget the insults / If you succeed in doing this, tell me how',
];

// -- -- -- -- --

function PageFooter() {
  const [reminder, setReminder] = useState<string>('');

  useEffect(() => {
    setReminder(reminders[Math.floor(Math.random() * reminders.length)]);
  }, []);

  return (
    <Box component="footer" sx={{ mb: 2, mt: 'auto' }} aria-label="Site footer">
      <Divider sx={{ mb: 2 }} />

      <Container
        maxWidth={false}
        sx={{ display: { sm: 'flex', xs: 'block' }, gap: 2, pb: 2 }}
      >
        <Box id="social-media" sx={{ p: 1 }}>
          <Stack
            direction={{ sm: 'column', xs: 'row' }}
            spacing={1.5}
            sx={{
              alignItems: { sm: 'flex-start', xs: 'center' },
              height: { sm: '100%' }, // Needed for space-between to work
              justifyContent: { sm: 'space-between', xs: 'center' },
            }}
          >
            {socialMedia.map(({ icon: IconComponent, name, url }) => (
              <IconButton
                key={name}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit Dan's ${name} profile`}
                color="inherit"
                sx={{
                  '&:hover': {
                    boxShadow: 4,
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                <IconComponent fontSize="large" />
              </IconButton>
            ))}
          </Stack>
        </Box>

        <Stack
          id="cruft"
          fontSize="0.875rem"
          spacing={2}
          sx={{ maxWidth: 'sm', p: 2 }}
        >
          <div>
            <Typography
              fontSize="inherit"
              fontWeight="bold"
              sx={{ display: 'block' }}
            >
              Dan Jacquemin
            </Typography>
            Seasoned UI/UX developer with a passion for{' '}
            <Typography
              component="span"
              fontSize="inherit"
              sx={{
                backgroundColor: 'action.hover',
                borderRadius: 0.5,
                fontFamily: 'monospace',
                px: 0.5,
                py: 0.25,
              }}
            >
              #a11y
            </Typography>{' '}
            and standards. Slowly coming to terms to geospatial mapping and
            analysis. I enjoy problem solving for large and small projects.
            Let&apos;s make beautiful sites.
          </div>

          <div>
            <Typography
              fontSize="inherit"
              fontWeight="bold"
              sx={{ display: 'block' }}
            >
              Important
            </Typography>
            <Typography
              variant="body2"
              fontSize="inherit"
              dangerouslySetInnerHTML={{ __html: reminder }}
            />
          </div>

          <div>
            <Typography
              fontSize="inherit"
              fontWeight="bold"
              sx={{ display: 'block' }}
            >
              Copyright © {new Date().getFullYear()}.
            </Typography>{' '}
            Some of it mine, some of it the respective creators{' '}
            <Typography component="span" variant="inherit" fontStyle="italic">
              (see source for more details)
            </Typography>
            . Cannot be held responsible for typos, wrong dates, badly labeled
            figures, incorrect addresses, inclement weather, mange, poor
            nutrition on race day, your team being blacked-out on TV, or
            anything else that you do not like or disagree with.
          </div>
        </Stack>
      </Container>
    </Box>
  );
}

export default PageFooter;
