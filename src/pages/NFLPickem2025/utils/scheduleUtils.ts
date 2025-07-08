import type { Team, ScheduleGame, ScheduleCSVRow } from '../types';

export const groupGamesByWeek = (schedule: ScheduleCSVRow[]) => {
  const weeks: {
    [key: number]: {
      gamesByDay: { [day: string]: ScheduleGame[] };
      byes: string[];
    };
  } = {};

  schedule.forEach((row) => {
    const week = parseInt(row.Week);

    if (isNaN(week) || week < 1 || week > 18) {
      console.warn(`Invalid week: ${row.Week}`);
      return;
    }

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

    if (game.awayTeam === 'bye') {
      weeks[week].byes.push(game.homeTeam);
    } else {
      // Get the day of the week for grouping
      let dayOfWeek = 'TBD';
      if (game.utcDateTime !== 'TBD') {
        const date = new Date(game.utcDateTime);

        if (isNaN(date.getTime())) {
          console.warn(`Invalid date: ${game.utcDateTime}`);
        }

        dayOfWeek = date.toLocaleDateString('en-US', {
          timeZone: 'America/New_York',
          weekday: 'long',
        });
      }

      if (!weeks[week].gamesByDay[dayOfWeek]) {
        weeks[week].gamesByDay[dayOfWeek] = [];
      }
      weeks[week].gamesByDay[dayOfWeek].push(game);
    }
  });

  // Sort games within each day by time, then by home team name
  Object.keys(weeks).forEach((weekNum) => {
    Object.keys(weeks[parseInt(weekNum)].gamesByDay).forEach((day) => {
      weeks[parseInt(weekNum)].gamesByDay[day].sort((a, b) => {
        // First sort by time
        if (a.utcDateTime !== b.utcDateTime) {
          if (a.utcDateTime === 'TBD') return 1;
          if (b.utcDateTime === 'TBD') return -1;
          return (
            new Date(a.utcDateTime).getTime() -
            new Date(b.utcDateTime).getTime()
          );
        }
        // If times are equal, sort by home team name
        return a.homeTeam.localeCompare(b.homeTeam);
      });
    });

    // Sort byes alphabetically
    weeks[parseInt(weekNum)].byes.sort();
  });

  return weeks;
};

export const createTeamAbbreviationMap = (
  teams: Team[],
): { [teamName: string]: string } => {
  const map: { [teamName: string]: string } = {};
  teams.forEach((team) => {
    map[team.Team] = team.Abbr;
  });
  return map;
};
