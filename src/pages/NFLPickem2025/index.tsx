import { CircularProgress } from '@mui/material';
import React from 'react';
import { useMemo, useCallback, useState } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import type { Team, ScheduleCSVRow, UserPicks } from './types';

import TeamWithLogo from './components/TeamWithLogo';
import scheduleCSV from './data/NFLSchedule2025.csv?raw';
import teamsCSV from './data/NFLTeamsByConfAndDiv.csv?raw';
import { useCSVData } from './hooks/useCSVData';
import { HiddenRadioInput, TeamLabel } from './nflPickem2025.styled';
import {
  createTeamAbbreviationMap,
  groupGamesByWeek,
} from './utils/scheduleUtils';

function NFLPickem2025() {
  const [teams, teamsLoading] = useCSVData<Team>(teamsCSV);
  const [schedule, scheduleLoading] = useCSVData<ScheduleCSVRow>(scheduleCSV);
  const [userPicks, setUserPicks] = useState<UserPicks>({});

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

  const weeklySchedule = useMemo(() => groupGamesByWeek(schedule), [schedule]);
  const weeks = Object.keys(weeklySchedule)
    .map(Number)
    .sort((a, b) => a - b);

  const dayOrder = [
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'TBD',
  ];

  const handlePickChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setUserPicks((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  return (
    <>
      <Typography variant="h1">NFL 2025 Schedule</Typography>

      {teamsLoading || (scheduleLoading && <CircularProgress />)}

      <Box component="div" sx={{ padding: (theme) => theme.spacing(2) }}>
        {weeks.map((weekNum) => (
          <Box key={weekNum} sx={{ mb: 4 }}>
            <Typography variant="h2" gutterBottom>
              Week {weekNum}
            </Typography>

            <Paper sx={{ mb: 2 }}>
              <TableContainer>
                <Table size="small" aria-label={`Week ${weekNum} NFL games`}>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: (theme) => theme.palette.primary.main,
                      }}
                    >
                      <TableCell
                        component="th"
                        scope="col"
                        sx={{
                          border: '1px solid white',
                          color: 'white',
                          fontWeight: 'bold',
                          width: '5em',
                        }}
                      >
                        Time (ET)
                      </TableCell>
                      <TableCell
                        component="th"
                        scope="col"
                        sx={{
                          border: '1px solid white',
                          color: 'white',
                          fontWeight: 'bold',
                          width: '20em',
                        }}
                      >
                        Away Team
                      </TableCell>
                      <TableCell
                        component="th"
                        scope="col"
                        sx={{
                          border: '1px solid white',
                          color: 'white',
                          fontWeight: 'bold',
                          width: '1em',
                        }}
                      >
                        vs
                      </TableCell>
                      <TableCell
                        component="th"
                        scope="col"
                        sx={{
                          border: '1px solid white',
                          color: 'white',
                          fontWeight: 'bold',
                          width: '20em',
                        }}
                      >
                        Home Team
                      </TableCell>
                      <th></th>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dayOrder.map((day) => {
                      const dayGames = weeklySchedule[weekNum].gamesByDay[day];
                      if (!dayGames || dayGames.length === 0) return null;

                      return (
                        <React.Fragment key={day}>
                          {/* Day header row */}
                          <TableRow>
                            <TableCell
                              component="th"
                              scope="colgroup"
                              colSpan={5}
                              sx={{
                                fontWeight: 'bold',
                                paddingBottom: '1rem',
                                paddingTop: '1rem',
                              }}
                            >
                              {day}
                            </TableCell>
                          </TableRow>
                          {/* Games for this day */}
                          {dayGames.map((game, index) => {
                            const gameId = `w-${weekNum}-${getTeamAbbr(game.awayTeam)}-vs-${getTeamAbbr(game.homeTeam)}`;
                            const homeTeamAbbr = getTeamAbbr(game.homeTeam);
                            const awayTeamAbbr = getTeamAbbr(game.awayTeam);

                            return (
                              <TableRow key={`${day}-${index}`}>
                                <TableCell
                                  sx={{ paddingLeft: 8, width: '12%' }}
                                >
                                  {formatGameTime(game.utcDateTime)}
                                </TableCell>
                                <TableCell>
                                  <TeamLabel
                                    checked={userPicks[gameId] === awayTeamAbbr}
                                    htmlFor={`${gameId}-away`}
                                  >
                                    <HiddenRadioInput
                                      type="radio"
                                      id={`${gameId}-away`}
                                      name={gameId}
                                      value={awayTeamAbbr}
                                      onChange={handlePickChange}
                                      checked={
                                        userPicks[gameId] === awayTeamAbbr
                                      }
                                      style={{ marginRight: 8 }}
                                    />
                                    <TeamWithLogo
                                      teamName={game.awayTeam}
                                      abbr={awayTeamAbbr}
                                    />
                                  </TeamLabel>
                                </TableCell>
                                <TableCell>vs</TableCell>
                                <TableCell>
                                  <TeamLabel
                                    checked={userPicks[gameId] === homeTeamAbbr}
                                    htmlFor={`${gameId}-home`}
                                  >
                                    <HiddenRadioInput
                                      type="radio"
                                      id={`${gameId}-home`}
                                      name={gameId}
                                      value={homeTeamAbbr}
                                      onChange={handlePickChange}
                                      checked={
                                        userPicks[gameId] === homeTeamAbbr
                                      }
                                      style={{ marginRight: 8 }}
                                    />
                                    <TeamWithLogo
                                      teamName={game.homeTeam}
                                      abbr={homeTeamAbbr}
                                    />
                                  </TeamLabel>
                                </TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {weeklySchedule[weekNum].byes.length > 0 && (
              <Box sx={{ mt: 2, pl: 8 }} fontSize="0.875rem">
                <Typography fontSize={'inherit'} gutterBottom>
                  On Bye:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Typography component="span" fontSize={'inherit'}>
                    {weeklySchedule[weekNum].byes.join(', ')}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      {['AFC', 'NFC'].map((conference) => (
        <Box key={conference} sx={{ fontSize: '0.875rem', mb: 3 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            {conference}
          </Typography>
          {['East', 'North', 'South', 'West'].map((division) => {
            const divisionTeams = useMemo(
              () =>
                teams.filter(
                  (team) =>
                    team.Conference === conference &&
                    team.Division === division,
                ),
              [teams, conference, division],
            );

            return (
              <Box key={division} sx={{ mb: 4, ml: 2 }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  {division}
                </Typography>
                {divisionTeams.map((team, index) => (
                  <Box key={index} sx={{ mb: 2, ml: 2 }}>
                    <TeamWithLogo teamName={team.Team} abbr={team.Abbr} />
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>
      ))}
    </>
  );
}

export default NFLPickem2025;
