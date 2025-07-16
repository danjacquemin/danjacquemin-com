import type {
  Team,
  ScheduleGame,
  ScheduleCSVRow,
  WeekData,
  UserPicks,
  WeeklyScheduleData,
  TeamGameInfo,
} from '../types';

import { PICKEM, TBD_DATE, BYE_TEAM } from '../consts';
import { isValidWeek } from './gameUtils';

// -- -- --

const isValidDate = (dateStr: string): boolean => {
  return dateStr !== TBD_DATE && !isNaN(new Date(dateStr).getTime());
};

// -- -- --

/**
 * Groups schedule data by week and day
 */
export const groupGamesByWeek = (schedule: ScheduleCSVRow[]) => {
  // initialize weeks object to store games and byes
  const weeks: {
    [key: number]: {
      gamesByDay: { [day: string]: ScheduleGame[] };
      byes: string[];
    };
  } = {};

  schedule.forEach((row) => {
    const week = parseInt(row.Week);

    // validate week number
    if (!isValidWeek(week)) {
      console.warn(`Invalid week: ${row.Week}`);
      return;
    }

    // initialize week if not exists
    if (!weeks[week]) {
      weeks[week] = { byes: [], gamesByDay: {} };
    }

    const game: ScheduleGame = {
      awayTeam: row['Away Team'],
      homeTeam: row['Home Team'],
      network: row.Network,
      utcDateTime: row['UTC Datetime'],
      week: week,
    };

    // handle bye weeks
    if (game.awayTeam === BYE_TEAM) {
      weeks[week].byes.push(game.homeTeam);
      return;
    }

    // determine day of the week for grouping
    let dayOfWeek = TBD_DATE;
    if (isValidDate(game.utcDateTime)) {
      try {
        const date = new Date(game.utcDateTime);
        dayOfWeek = date.toLocaleDateString('en-US', {
          timeZone: 'America/New_York',
          weekday: 'long',
        });
      } catch (error) {
        console.warn(`Invalid date format: ${game.utcDateTime}`, error);
      }
    }

    // onitialize day if not exists
    if (!weeks[week].gamesByDay[dayOfWeek]) {
      weeks[week].gamesByDay[dayOfWeek] = [];
    }
    weeks[week].gamesByDay[dayOfWeek].push(game);
  });

  // pre-sort games and byes to avoid repeated sorting
  Object.keys(weeks).forEach((weekNum) => {
    const week = parseInt(weekNum);
    Object.keys(weeks[week].gamesByDay).forEach((day) => {
      weeks[week].gamesByDay[day].sort((a, b) => {
        // Sort by time, then by home team name
        if (a.utcDateTime !== b.utcDateTime) {
          if (a.utcDateTime === TBD_DATE) return 1;
          if (b.utcDateTime === TBD_DATE) return -1;
          return (
            new Date(a.utcDateTime).getTime() -
            new Date(b.utcDateTime).getTime()
          );
        }
        return a.homeTeam.localeCompare(b.homeTeam);
      });
    });

    // sort byes alphabetically
    weeks[week].byes.sort();
  });

  return weeks;
};

/**
 * Creates a map of team names to abbreviations
 */
export const createTeamAbbreviationMap = (
  teams: Team[],
): { [teamName: string]: string } => {
  // create a map of team names to abbreviations
  return teams.reduce(
    (map, team) => {
      map[team.Team] = team.Abbr;
      return map;
    },
    {} as { [teamName: string]: string },
  );
};

/**
 * Gets the date range for a week's games
 */
export const getWeekDateRange = (weekGames: WeekData) => {
  // flatten games for processing
  const games = Object.values(weekGames.gamesByDay).flat() as ScheduleGame[];

  // get valid dates, sorted
  const validDates = games
    .filter((game) => isValidDate(game.utcDateTime))
    .map((game) => new Date(game.utcDateTime))
    .sort((a, b) => a.getTime() - b.getTime());

  if (validDates.length === 0) return '';

  const firstDate = validDates[0];
  const lastDate = validDates[validDates.length - 1];

  // handle TBD games
  const hasTBDGames = games.some((game) => game.utcDateTime === TBD_DATE);
  let effectiveLastDate = lastDate;

  if (hasTBDGames) {
    try {
      // assume TBD games are on sunday after first game
      const firstGameDate = firstDate;
      const daysUntilSunday = (7 - firstGameDate.getDay()) % 7;
      const sundayAfter = new Date(firstGameDate);
      sundayAfter.setDate(firstGameDate.getDate() + daysUntilSunday);
      effectiveLastDate = sundayAfter > lastDate ? sundayAfter : lastDate;
    } catch (error) {
      console.warn('Error calculating TBD game date', error);
    }
  }

  // format date range
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });

  return firstDate.toDateString() === effectiveLastDate.toDateString()
    ? `(${formatDate(firstDate)})`
    : `(${formatDate(firstDate)} - ${formatDate(effectiveLastDate)})`;
};

/**
 * Calculates a team's win-loss record based on user picks
 */
export const calculateTeamRecord = (
  team: Team,
  weeks: number[],
  weeklySchedule: WeeklyScheduleData,
  userPicks: UserPicks,
  getTeamAbbr: (teamName: string) => string,
) => {
  const teamAbbr = getTeamAbbr(team.Team);
  let wins = 0;
  let losses = 0;

  weeks.forEach((weekNum) => {
    const weekData = weeklySchedule[weekNum];
    if (!weekData) {
      console.warn(`No data for week ${weekNum}`);
      return;
    }

    // skip bye weeks
    if (weekData.byes.includes(team.Team)) return;

    // find game for team
    const allGames = Object.values(weekData.gamesByDay).flat();
    const teamGame = allGames.find(
      (game) => game.awayTeam === team.Team || game.homeTeam === team.Team,
    );

    if (!teamGame) {
      console.warn(`No game found for ${team.Team} in week ${weekNum}`);
      return;
    }

    const gameId = generateGameId(
      weekNum,
      teamGame.awayTeam,
      teamGame.homeTeam,
      getTeamAbbr,
    );
    const userPick = userPicks[gameId];

    if (userPick) {
      if (userPick === teamAbbr) {
        wins++;
      } else {
        losses++;
      }
    }
  });

  return { losses, wins };
};

/**
 * Gets a team's schedule for specified weeks
 */
export function getTeamScheduleForWeeks(
  team: Team,
  weeks: number[],
  weeklySchedule: WeeklyScheduleData,
): (TeamGameInfo | null)[] {
  return weeks.map((weekNum) => {
    const weekData = weeklySchedule[weekNum];
    if (!weekData) {
      console.warn(`No data for week ${weekNum}`);
      return null;
    }

    // check for bye week
    if (weekData.byes.includes(team.Team)) {
      return { type: 'bye' } as TeamGameInfo;
    }

    // find game for team
    const game = Object.values(weekData.gamesByDay)
      .flat()
      .find((g) => g.homeTeam === team.Team || g.awayTeam === team.Team);

    if (!game) {
      console.warn(`No game found for ${team.Team} in week ${weekNum}`);
      return null;
    }

    const isHome = game.homeTeam === team.Team;
    const opponent = isHome ? game.awayTeam : game.homeTeam;

    return {
      game,
      isHome,
      opponent,
      type: 'game',
      weekNum,
    } as TeamGameInfo;
  });
}

/**
 * Gets background color for a game cell based on user picks
 */
export const getGameCellBackgroundColor = (
  gameInfo: TeamGameInfo,
  weekNum: number,
  team: Team,
  userPicks: UserPicks,
  getTeamAbbr: (teamName: string) => string,
  theme: import('@mui/material/styles').Theme,
) => {
  if (!gameInfo || gameInfo.type !== 'game') {
    return 'inherit';
  }

  const gameId = generateGameId(
    weekNum,
    gameInfo.game.awayTeam,
    gameInfo.game.homeTeam,
    getTeamAbbr,
  );
  const userPick = userPicks[gameId];
  const teamAbbr = getTeamAbbr(team.Team);

  if (userPick) {
    return userPick === teamAbbr ? PICKEM.COLOR_WINNER : PICKEM.COLOR_LOSER;
  }

  return theme.palette.custom?.backgroundLightGrey ?? 'transparent';
};

/**
 * Generates a unique game ID using team abbreviations
 */
export const generateGameId = (
  weekNum: number,
  awayTeam: string,
  homeTeam: string,
  getTeamAbbr: (teamName: string) => string,
) => {
  // generate unique game ID using team abbreviations
  return `w-${weekNum}-${getTeamAbbr(awayTeam)}-vs-${getTeamAbbr(homeTeam)}`;
};

/**
 * Calculates total games in a season across specified weeks
 */
export function getTotalGamesInSeason(
  weeks: number[],
  weeklySchedule: WeeklyScheduleData,
): number {
  return weeks.reduce((total, weekNum) => {
    const weekData = weeklySchedule[weekNum];
    if (!weekData) {
      console.warn(`No data for week ${weekNum}`);
      return total;
    }

    // count games for this week
    return total + Object.values(weekData.gamesByDay).flat().length;
  }, 0);
}
