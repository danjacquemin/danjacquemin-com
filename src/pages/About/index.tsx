import { Box, Link, Typography } from '@mui/material';

import Page from '../../templates/Page';

function About() {
  return (
    <Page title="About">
      <Box component="section" sx={{ flex: '1 1 50%' }}>
        <Typography variant="h1">Hello World!</Typography>
      </Box>

      <Box component="section" sx={{ flex: '1 1 50%' }}>
        <Typography variant="h2" gutterBottom>
          The story so far&hellip;
        </Typography>
        <Box component="div" sx={{ pb: 6, px: 4 }}>
          <Typography component="p">
            Universe created. <br />
            Some time passes. <br />
            Dinosaurs. <em>Rawr!</em> <br />
            Romans invent concrete. <br />
            2001. v1 of this site. <br />
            2001-2023. Various updates. <br />
            2024: Again?! Yes. But, this time with React + Vite +{' '}
            <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer">
              Tailwind
            </a>
            .
            <br />
            2025: And <em>again</em> with{' '}
            <Link href="https://mui.com/" target="_blank" rel="noreferrer">
              MUI
            </Link>
            .
          </Typography>
        </Box>

        <Typography variant="h2" gutterBottom>
          Your timeline is vague&hellip;
        </Typography>
        <Box component="div" sx={{ pb: 6, px: 4 }}>
          <Typography component="p">Well, yeah.</Typography>
        </Box>

        <Typography variant="h2" gutterBottom>
          Seriously though&hellip;
        </Typography>
        <Box component="div" sx={{ pb: 6, px: 4 }}>
          <Typography component="p">
            I&lsquo;ve been a web developer for a long time. Like, I got started
            on{' '}
            <Link
              href="https://en.wikipedia.org/wiki/Gopher_(protocol)"
              target="_blank"
              rel="noreferrer"
            >
              Gopher
            </Link>{' '}
            and the first web page I built was for{' '}
            <Link
              href="https://en.wikipedia.org/wiki/Netscape_(web_browser)#Netscape-based_(versions_1.0%E2%80%934.8)_releases"
              target="_blank"
              rel="noreferrer"
            >
              Netscape Navigator
            </Link>
            . It had an image. I was very proud. Then I spent a decade or two
            doing doing Web Development eventually working my way to to Lead
            Front-end Developer at{' '}
            <Link href="http://www.ets.org" target="_blank" rel="noreferrer">
              ETS
            </Link>{' '}
            with strong focus on standards, #a11y, and usability. Sadly we got
            to 2023 and my role got outsourced. It was fun while it lasted.
          </Typography>
          <Typography component="p">
            Good news though, the great folks at the Asplundh Digital
            Innovations group have opted to fund my adventures.
            <br />
            [heart-hands image goes here]
          </Typography>
        </Box>

        <Typography variant="h2" gutterBottom>
          Okay, so what exactly are you doing&hellip;
        </Typography>
        <Box component="div" sx={{ pb: 6, px: 4 }}>
          <Typography component="p">
            We&lsquo;re going to work through building out a site using:
          </Typography>
          <Box component="ul">
            <Typography component="li">React + Vite + Tailwind</Typography>
            <Typography component="li">
              Redo the Tailwind version using{' '}
              <Link href="https://mui.com/" target="_blank" rel="noreferrer">
                MUI
              </Link>
            </Typography>
          </Box>
        </Box>

        <Typography variant="h2" gutterBottom>
          Sounds like fun&hellip;
        </Typography>
        <Box component="div" sx={{ pb: 6, px: 4 }}>
          <Typography component="p">It does, doesn&lsquo;t it?!</Typography>
        </Box>

        <Typography variant="h2" gutterBottom>
          Obtw&hellip;
        </Typography>
        <Box component="div" sx={{ pb: 6, px: 4 }}>
          <Typography component="p">
            If you need a senior type developer I&lsquo;m always happy to
            listen, so hit me up.
            <br />
            Deets on LinkedIn &mdash;{' '}
            <Link
              href="https://www.linkedin.com/in/dan-jacquemin/"
              target="_blank"
              rel="noreferrer"
            >
              linkedin.com/in/dan-jacquemin/
            </Link>
          </Typography>
        </Box>
      </Box>
    </Page>
  );
}

export default About;
