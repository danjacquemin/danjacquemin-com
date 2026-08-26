import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';

import { BYE_MARKER } from '@/features/base';

import type { NFLGame, NFLSeason } from '@/features/nfl-schedule';
import type { NFLStadiumList } from '@/features/nfl-stadiums';
import type { NFLTeam, NFLTeamList } from '@/features/nfl-teams';

type SeasonWeekListProps = {
  season: NFLSeason;
  stadiums: NFLStadiumList;
  teams: NFLTeamList;
};

function teamDisplayName(team: NFLTeam): string {
  return `${team.teamCity} ${team.teamName}`;
}

function resolveTeamName(teams: NFLTeamList, id: string): string {
  const team = teams.find((entry) => entry.id === id);
  return team ? teamDisplayName(team) : id;
}

function resolveStadiumName(
  stadiums: NFLStadiumList,
  stadiumId: string | null,
): string | null {
  if (stadiumId === null) return null;
  return (
    stadiums.find((stadium) => stadium.id === stadiumId)?.stadiumName ??
    stadiumId
  );
}

function formatKickoff(gameDateTimeUTC: string): string {
  if (gameDateTimeUTC === 'TBD') return 'TBD';

  return new Date(gameDateTimeUTC).toLocaleString('en-US', {
    day: 'numeric',
    hour: 'numeric',
    hour12: true,
    minute: '2-digit',
    month: 'short',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
    weekday: 'short',
  });
}

function gamePrimary(game: NFLGame, teams: NFLTeamList): string {
  const home = resolveTeamName(teams, game.homeTeamId);

  // Bye rows are not ranked later; they still appear in this read-only list.
  if (game.awayTeamId === BYE_MARKER) {
    return `${home} — bye`;
  }

  return `${resolveTeamName(teams, game.awayTeamId)} vs ${home}`;
}

function gameSecondary(game: NFLGame, stadiums: NFLStadiumList): string {
  if (game.awayTeamId === BYE_MARKER) return 'Bye week';

  const stadium = resolveStadiumName(stadiums, game.stadiumId);
  const kickoff = formatKickoff(game.gameDateTimeUTC);
  return stadium ? `${stadium} · ${kickoff}` : kickoff;
}

function SeasonWeekList({ season, stadiums, teams }: SeasonWeekListProps) {
  return (
    <Box>
      {season.games.map((week) => (
        <Box
          key={week.weekNumber}
          component="section"
          aria-labelledby={`week-${week.weekNumber}-heading`}
          sx={{ mt: 4 }}
        >
          <Typography
            id={`week-${week.weekNumber}-heading`}
            variant="h2"
            gutterBottom
          >
            Week {week.weekNumber}
          </Typography>
          <List disablePadding>
            {week.games.map((game) => (
              <ListItem key={game.id} disableGutters>
                <ListItemText
                  primary={gamePrimary(game, teams)}
                  secondary={gameSecondary(game, stadiums)}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
}

export default SeasonWeekList;
