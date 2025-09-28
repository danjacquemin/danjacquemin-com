export type UserPicks = {
  [gameId: string]: string; // "1-KC-vs-DEN": "KC"
};

// material-react-table (used for results)
export type TableRowData = {
  [key: string]: string | number;
  id: number;
  user: string;
  correct: number;
  gamesPlayed: number;
};

export type Team = {
  Conference: string;
  Division: string;
  Abbr: string;
  Team: string;
};

export type ScheduleCSVRow = {
  Week: string;
  'Away Team': string;
  'Home Team': string;
  'UTC Datetime': string;
  Network: string;
};

export type ScheduleGame = {
  week: number;
  awayTeam: string;
  homeTeam: string;
  utcDateTime: string; // ISO 8601 format: "2025-09-05T00:20:00Z"
  network: string;
  isByeWeek?: boolean; // true when awayTeam is "bye"
  isTBD?: boolean; // true when utcDateTime is "TBD"
};

export type WeekData = {
  gamesByDay: { [day: string]: ScheduleGame[] };
  byes: string[];
};

export type WeeklySchedule = {
  week: number;
  games: ScheduleGame[];
};

export type Season = {
  year: number;
  weeks: WeeklySchedule[];
};

export type TeamSchedule = {
  teamName: string;
  games: ScheduleGame[];
};

export type TeamScheduleMap = {
  [teamName: string]: TeamSchedule;
};

export type TeamMap = {
  [teamName: string]: Team;
};

export type TeamAbbreviationMap = {
  [teamName: string]: string;
};

export type WeeklyScheduleData = {
  [weekNum: number]: WeekData;
};

export type TeamGameInfo =
  | null
  | { type: 'bye' }
  | {
      type: 'game';
      game: ScheduleGame;
      isHome: boolean;
      opponent: string;
      weekNum: number;
    };
