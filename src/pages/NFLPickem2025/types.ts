export type Team = {
  Conference: string;
  Division: string;
  Abbr: string;
  Team: string;
};

export type ScheduleGame = {
  week: string;
  date: string;
  time: string;
  home_team: string;
  away_team: string;
  venue: string;
  city: string;
};

export type TeamSchedule = {
  teamName: string;
  games: ScheduleGame[];
};

export type TeamScheduleMap = {
  [key: string]: TeamSchedule;
};

export type TeamMap = {
  [key: string]: Team;
};

export type TeamAbbrMap = {
  [key: string]: string;
};
