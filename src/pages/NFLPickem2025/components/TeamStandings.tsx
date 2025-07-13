import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from '@mui/material';
import { memo, useMemo, Fragment } from 'react';

import type { Team, UserPicks, WeeklyScheduleData } from '../types';

import { PICKEM } from '../consts';
import {
  StyledDivisionHeaderCell,
  StyledGameCell,
  StyledTeamCell,
} from '../nflPickem2025.styled';
import TeamWithLogo from './TeamWithLogo';
import { createGameId, isValidWeek } from '../utils/gameUtils';
import {
  calculateTeamRecord,
  getTeamScheduleForWeeks,
  getGameCellBackgroundColor,
} from '../utils/scheduleUtils';

type Division = 'East' | 'North' | 'South' | 'West';
const DIVISIONS: readonly Division[] = [
  'East',
  'North',
  'South',
  'West',
] as const;

interface TeamStandingsProps {
  teams: Team[];
  selectedConference: 'AFC' | 'NFC';
  weeks: number[];
  weeklySchedule: WeeklyScheduleData;
  userPicks: UserPicks;
  getTeamAbbr: (teamName: string) => string;
}

/**
 * Validates team data
 */
const isValidTeams = (teams: Team[]): boolean => {
  return Array.isArray(teams) && teams.length > 0;
};

/**
 * Validates weeks array
 */
const isValidWeeks = (weeks: number[]): boolean => {
  return Array.isArray(weeks) && weeks.every(isValidWeek);
};

/**
 * Validates weekly schedule
 */
const isValidWeeklySchedule = (weeklySchedule: WeeklyScheduleData): boolean => {
  return weeklySchedule !== null && typeof weeklySchedule === 'object';
};

/**
 * Validates user picks
 */
const isValidUserPicks = (userPicks: UserPicks): boolean => {
  return userPicks !== null && typeof userPicks === 'object';
};

/**
 * Displays team standings by conference and division
 */
const TeamStandings = memo(
  ({
    getTeamAbbr,
    selectedConference,
    teams,
    userPicks,
    weeklySchedule,
    weeks,
  }: TeamStandingsProps) => {
    // Validate inputs
    if (!isValidTeams(teams)) {
      return <Typography>No teams data available</Typography>;
    }
    if (!isValidWeeks(weeks)) {
      return <Typography>No weeks data available</Typography>;
    }
    if (!isValidWeeklySchedule(weeklySchedule)) {
      return <Typography>No schedule data available</Typography>;
    }
    if (!isValidUserPicks(userPicks)) {
      return <Typography>No user picks available</Typography>;
    }
    if (typeof getTeamAbbr !== 'function') {
      console.error('getTeamAbbr is not a function');
      return <Typography>Error: Invalid team abbreviation function</Typography>;
    }

    // pre-calculate all team records to avoid recalculation
    const teamRecords = useMemo(() => {
      return teams.reduce(
        (acc, team) => {
          acc[team.Team] = calculateTeamRecord(
            team,
            weeks,
            weeklySchedule,
            userPicks,
            getTeamAbbr,
          );
          return acc;
        },
        {} as Record<string, { wins: number; losses: number }>,
      );
    }, [teams, weeks, weeklySchedule, userPicks, getTeamAbbr]);

    // Pre-calculate sorted teams by division
    const divisionTeams = useMemo(() => {
      return DIVISIONS.reduce(
        (acc, division) => {
          const teamsInDivision = teams.filter(
            (team) =>
              team.Conference === selectedConference &&
              team.Division === division,
          );

          acc[division] = teamsInDivision.sort((a, b) => {
            const aRecord = teamRecords[a.Team];
            const bRecord = teamRecords[b.Team];

            if (aRecord.wins !== bRecord.wins) {
              return bRecord.wins - aRecord.wins;
            }
            if (aRecord.losses !== bRecord.losses) {
              return aRecord.losses - bRecord.losses;
            }

            return a.Team.localeCompare(b.Team);
          });
          return acc;
        },
        {} as Record<Division, Team[]>,
      );
    }, [teams, selectedConference, teamRecords]);

    return (
      <TableContainer component={Paper}>
        <Table
          size="small"
          sx={{ fontSize: '0.75rem' }}
          aria-label={`${selectedConference} conference team standings`}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>
                Team
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  minWidth: '60px',
                  textAlign: 'center',
                }}
              >
                W-L
              </TableCell>
              {weeks.map((weekNum) => (
                <TableCell
                  key={weekNum}
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    minWidth: '40px',
                    textAlign: 'center',
                  }}
                >
                  {weekNum}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody role="rowgroup">
            {DIVISIONS.map((division) => (
              <Fragment key={division}>
                <TableRow>
                  <StyledDivisionHeaderCell colSpan={weeks.length + 2}>
                    {selectedConference} {division}
                  </StyledDivisionHeaderCell>
                </TableRow>
                {divisionTeams[division].map((team) => {
                  const { losses, wins } = teamRecords[team.Team];
                  const teamGames = getTeamScheduleForWeeks(
                    team,
                    weeks,
                    weeklySchedule,
                  );

                  return (
                    <TableRow key={team.Team}>
                      <TableCell>
                        <TeamWithLogo
                          teamName={team.Team.split(' ').slice(0, -1).join(' ')}
                          abbr={team.Abbr}
                          logoSize={PICKEM.SMALL_LOGO_SIZE}
                        />
                      </TableCell>
                      <StyledTeamCell>
                        <Typography component="span">{wins}</Typography>
                        <Typography component="span">-</Typography>
                        <Typography component="span">{losses}</Typography>
                      </StyledTeamCell>
                      {teamGames.map((gameInfo, weekIndex) => {
                        const backgroundColor = gameInfo
                          ? getGameCellBackgroundColor(
                              gameInfo,
                              weeks[weekIndex],
                              team,
                              userPicks,
                              getTeamAbbr,
                            )
                          : 'inherit';

                        const hasPick =
                          gameInfo?.type === 'game' &&
                          userPicks[
                            createGameId(
                              weeks[weekIndex],
                              gameInfo.game.awayTeam,
                              gameInfo.game.homeTeam,
                              getTeamAbbr,
                            )
                          ];

                        return (
                          <StyledGameCell
                            key={weekIndex}
                            sx={{
                              backgroundColor,
                              color: hasPick ? 'white' : 'inherit',
                              fontWeight: hasPick ? 'bold' : 'normal',
                            }}
                          >
                            {' '}
                            {!gameInfo ? (
                              '-'
                            ) : gameInfo.type === 'bye' ? (
                              <Box sx={{ color: 'text.secondary' }}>BYE</Box>
                            ) : (
                              <Box>
                                {gameInfo.isHome ? '' : '@'}{' '}
                                {getTeamAbbr(gameInfo.opponent ?? '')}
                              </Box>
                            )}
                          </StyledGameCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  },
);

TeamStandings.displayName = 'TeamStandings';

export default TeamStandings;
