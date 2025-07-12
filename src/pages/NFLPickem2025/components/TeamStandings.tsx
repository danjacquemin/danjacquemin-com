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
import React, { useMemo } from 'react';

import type { Team, UserPicks, WeeklyScheduleData } from '../types';

import { PICKEM } from '../consts';
import TeamWithLogo from './TeamWithLogo';
import { createGameId } from '../utils/gameUtils';
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

import type { Theme } from '@mui/material/styles';

const TABLE_STYLES = {
  divisionHeader: {
    backgroundColor: (theme: Theme) => theme.palette.grey[100],
    fontSize: '0.875rem',
    fontWeight: 'bold',
  },
  gameCell: {
    fontSize: '0.625rem',
    padding: '4px 2px',
    textAlign: 'center' as const,
  },
  teamCell: { fontSize: '0.75rem', textAlign: 'center' as const },
} as const;

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
  return Array.isArray(weeks) && weeks.length > 0;
};

export default function TeamStandings({
  getTeamAbbr,
  selectedConference,
  teams,
  userPicks,
  weeklySchedule,
  weeks,
}: TeamStandingsProps) {
  if (!isValidTeams(teams)) {
    return <Typography>No teams data available</Typography>;
  }
  if (!isValidWeeks(weeks)) {
    return <Typography>No weeks data available</Typography>;
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

  if (!teams || teams.length === 0) {
    return <Typography>No teams data available</Typography>;
  }

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
              sx={{ fontWeight: 'bold', minWidth: '60px', textAlign: 'center' }}
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

        <TableBody>
          {DIVISIONS.map((division) => (
            <React.Fragment key={division}>
              <TableRow>
                <TableCell
                  colSpan={weeks.length + 2}
                  sx={TABLE_STYLES.divisionHeader}
                >
                  {selectedConference} {division}
                </TableCell>
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
                    <TableCell sx={TABLE_STYLES.teamCell}>
                      <Typography component="span">{wins}</Typography>
                      <Typography component="span">-</Typography>
                      <Typography component="span">{losses}</Typography>
                    </TableCell>
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
                        <TableCell
                          key={weekIndex}
                          sx={{
                            ...TABLE_STYLES.gameCell,
                            backgroundColor,
                            color: hasPick ? 'white' : 'inherit',
                            fontWeight: hasPick ? 'bold' : 'normal',
                          }}
                        >
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
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
