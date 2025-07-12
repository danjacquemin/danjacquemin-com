import {
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Container,
  Box,
} from '@mui/material';
import React, { useMemo, useCallback, useState } from 'react';

import type {
  Team,
  ScheduleCSVRow,
  UserPicks,
  WeeklyScheduleData,
} from './types';

import TeamStandings from './components/TeamStandings';
// Component imports
import WeekAccordion from './components/WeekAccordion';
import { PICKEM } from './consts';
import scheduleCSV from './data/NFLSchedule2025.csv?raw';
import teamsCSV from './data/NFLTeamsByConfAndDiv.csv?raw';
import { useCSVData } from './hooks/useCSVData';
import { useLocalStorage } from './hooks/useLocalStorage';
import Page from '../../templates/Page';
import {
  createTeamAbbreviationMap,
  groupGamesByWeek,
  getTotalGamesInSeason,
} from './utils/scheduleUtils';

function NFLPickem2025() {
  const [teams, teamsLoading] = useCSVData<Team>(teamsCSV);
  const [schedule, scheduleLoading] = useCSVData<ScheduleCSVRow>(scheduleCSV);
  const [userPicks, setUserPicks] = useLocalStorage<UserPicks>('userPicks', {});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedConference, setSelectedConference] = useState<'AFC' | 'NFC'>(
    'AFC',
  );

  const teamAbbreviationMap = useMemo(
    () => createTeamAbbreviationMap(teams),
    [teams],
  );

  const getTeamAbbr = useCallback(
    (teamName: string): string => {
      const abbr = teamAbbreviationMap[teamName];
      if (!abbr) {
        console.warn(`Missing abbreviation for team: ${teamName}`);
        return teamName.substring(0, 3).toUpperCase();
      }
      return abbr;
    },
    [teamAbbreviationMap],
  );

  const formatGameTime = useCallback((utcDateTime: string): string => {
    if (utcDateTime === 'TBD') return 'TBD';

    const date = new Date(utcDateTime);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${utcDateTime}`);
      return 'Invalid Time';
    }

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
      minute: '2-digit',
      timeZone: 'America/New_York',
    });
  }, []);

  const weeklySchedule: WeeklyScheduleData = useMemo(
    () => groupGamesByWeek(schedule),
    [schedule],
  );
  const weeks = Object.keys(weeklySchedule)
    .map(Number)
    .sort((a, b) => a - b);

  const totalGamesInSeason = useMemo(
    () => getTotalGamesInSeason(weeks, weeklySchedule),
    [weeks, weeklySchedule],
  );

  const handlePickChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setUserPicks({
        ...userPicks,
        [name]: value,
      });
    },
    [setUserPicks, userPicks],
  );

  const handleConferenceChange = useCallback(
    (_: React.SyntheticEvent, newValue: 'AFC' | 'NFC') => {
      setSelectedConference(newValue);
    },
    [],
  );

  if (teamsLoading || scheduleLoading) {
    return (
      <Page title="NFL Pick'em 2025" maxWidth={false}>
        <CircularProgress />
      </Page>
    );
  }

  return (
    <Page title="NFL Pick'em 2025" maxWidth={false}>
      <Typography variant="h1" maxWidth={'xl'} sx={{ margin: 'auto' }}>
        NFL 2025 Schedule
      </Typography>

      <Container
        maxWidth={false}
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          flexDirection: 'row',
          gap: 4,
          mt: 4,
          position: 'relative',
        }}
      >
        {/* Left column - Games table */}
        <Box
          component="div"
          sx={{
            flex: `0 0 ${PICKEM.LEFT_COLUMN_WIDTH}`,
            padding: (theme) => theme.spacing(2),
          }}
        >
          {weeks.map((weekNum, idx) => (
            <WeekAccordion
              key={weekNum}
              weekNum={weekNum}
              weeklySchedule={weeklySchedule}
              userPicks={userPicks}
              setUserPicks={setUserPicks}
              getTeamAbbr={getTeamAbbr}
              formatGameTime={formatGameTime}
              handlePickChange={handlePickChange}
              defaultExpanded={idx === 0}
            />
          ))}
        </Box>

        {/* Right column - Teams with tabs */}
        <Box
          component="div"
          sx={{
            alignSelf: 'flex-start',
            flex: 1,
            height: 'fit-content',
            paddingTop: 3,
            position: 'sticky',
            top: '0',
          }}
        >
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 2, mb: 2 }}>
            <div>
              Games Selected: {Object.keys(userPicks).length} of{' '}
              {totalGamesInSeason}
            </div>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setConfirmOpen(true)}
              disabled={Object.keys(userPicks).length === 0}
              sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                fontWeight: 'bold',
                padding: '0.2em 1em',
                textTransform: 'none',
              }}
              aria-label="Reset schedule"
            >
              Reset Schedule
            </Button>
          </Box>

          <Tabs
            value={selectedConference}
            onChange={handleConferenceChange}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="AFC" value="AFC" disableRipple />
            <Tab label="NFC" value="NFC" disableRipple />
          </Tabs>

          <TeamStandings
            teams={teams}
            selectedConference={selectedConference}
            weeks={weeks}
            weeklySchedule={weeklySchedule}
            userPicks={userPicks}
            getTeamAbbr={getTeamAbbr}
          />
        </Box>
      </Container>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="clear-picks-dialog-title"
      >
        <DialogTitle id="clear-picks-dialog-title">
          Clear All Picks?
        </DialogTitle>
        <DialogContent>
          This action cannot be undone.
          <br />
          Are you sure you want to clear all your picks?
        </DialogContent>
        <DialogActions sx={{ display: 'flex', gap: 2, p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmOpen(false)}
            color="primary"
            autoFocus
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setUserPicks({});
              setConfirmOpen(false);
            }}
            color="error"
            variant="contained"
            aria-label="Confirm clear all picks"
          >
            Yes, Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
}

export default NFLPickem2025;
