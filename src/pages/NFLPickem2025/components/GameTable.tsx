import {
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from '@mui/material';
import React, { memo } from 'react';

import type { UserPicks, WeekData } from '../types';

import { dayOrder } from '../consts';
import {
  HiddenRadioInput,
  TeamLabel,
  StyledTableBody,
} from '../nflPickem2025.styled';
import TeamWithLogo from './TeamWithLogo';
import { createGameId, isValidWeek } from '../utils/gameUtils';

interface GameTableProps {
  weekNum: number;
  weekData: WeekData;
  userPicks: UserPicks;
  getTeamAbbr: (teamName: string) => string;
  formatGameTime: (utcDateTime: string) => string;
  handlePickChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Validates week data
 */
const isValidWeekData = (weekData: WeekData): boolean => {
  return (
    !!weekData &&
    !!weekData.gamesByDay &&
    Object.keys(weekData.gamesByDay).length > 0
  );
};

const GameTable = memo(
  ({
    formatGameTime,
    getTeamAbbr,
    handlePickChange,
    userPicks,
    weekData,
    weekNum,
  }: GameTableProps) => {
    // Validate inputs
    if (!isValidWeek(weekNum)) {
      console.warn(`Invalid week number: ${weekNum}`);
      return null;
    }
    if (!isValidWeekData(weekData)) {
      console.warn(`Invalid or empty weekData for week ${weekNum}`);
      return null;
    }

    return (
      <Paper sx={{ mb: 2 }} elevation={0}>
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
                    border: (theme) =>
                      `1px solid ${theme.palette.common.white}`,
                    color: (theme) => theme.palette.common.white,
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
                    border: (theme) =>
                      `1px solid ${theme.palette.common.white}`,
                    color: (theme) => theme.palette.common.white,
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
                    border: (theme) =>
                      `1px solid ${theme.palette.common.white}`,
                    color: (theme) => theme.palette.common.white,
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
                    border: (theme) =>
                      `1px solid ${theme.palette.common.white}`,
                    color: (theme) => theme.palette.common.white,
                    fontWeight: 'bold',
                    width: '20em',
                  }}
                >
                  Home Team
                </TableCell>
              </TableRow>
            </TableHead>
            <StyledTableBody role="rowgroup">
              {dayOrder.map((day) => {
                const dayGames = weekData.gamesByDay[day];
                if (!dayGames || dayGames.length === 0) return null;

                return (
                  <React.Fragment key={day}>
                    {/* Day header row */}
                    <TableRow className="day-header">
                      <TableCell
                        component="th"
                        scope="colgroup"
                        colSpan={4}
                        sx={{
                          fontWeight: 'bold',
                          paddingBottom: '1rem',
                          paddingTop: '3rem',
                        }}
                      >
                        {day}
                      </TableCell>
                    </TableRow>
                    {/* Games for this day */}
                    {dayGames.map((game, index) => {
                      const gameId = createGameId(
                        weekNum,
                        game.awayTeam,
                        game.homeTeam,
                        getTeamAbbr,
                      );
                      const homeTeamAbbr = getTeamAbbr(game.homeTeam);
                      const awayTeamAbbr = getTeamAbbr(game.awayTeam);

                      return (
                        <TableRow key={`${day}-${index}`}>
                          <TableCell sx={{ paddingLeft: 4, width: '10rem' }}>
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
                                checked={userPicks[gameId] === awayTeamAbbr}
                                style={{ marginRight: 8 }}
                                aria-label={`Pick ${game.awayTeam} to win vs ${game.homeTeam}`}
                              />
                              <Box
                                sx={{
                                  fontWeight:
                                    userPicks[gameId] === awayTeamAbbr
                                      ? 'bold'
                                      : 'normal',
                                  opacity:
                                    userPicks[gameId] &&
                                    userPicks[gameId] !== awayTeamAbbr
                                      ? 0.4
                                      : 1,
                                }}
                              >
                                <TeamWithLogo
                                  teamName={game.awayTeam}
                                  abbr={awayTeamAbbr}
                                />
                              </Box>
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
                                checked={userPicks[gameId] === homeTeamAbbr}
                                style={{ marginRight: 8 }}
                                aria-label={`Pick ${game.homeTeam} to win vs ${game.awayTeam}`}
                              />
                              <Box
                                sx={{
                                  fontWeight:
                                    userPicks[gameId] === homeTeamAbbr
                                      ? 'bold'
                                      : 'normal',
                                  opacity:
                                    userPicks[gameId] &&
                                    userPicks[gameId] !== homeTeamAbbr
                                      ? 0.4
                                      : 1,
                                }}
                              >
                                <TeamWithLogo
                                  teamName={game.homeTeam}
                                  abbr={homeTeamAbbr}
                                />
                              </Box>
                            </TeamLabel>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </StyledTableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  },
);

GameTable.displayName = 'GameTable';

export default GameTable;
