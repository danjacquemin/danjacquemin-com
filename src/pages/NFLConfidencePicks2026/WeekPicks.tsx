import { arrayMove } from '@dnd-kit/sortable';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useMemo, useRef, useState } from 'react';

import { scoreWeek, withWeek } from '@/features/nfl-confidence-picks';

import GamePickList from './GamePickList';
import {
  loadWeekRows,
  readUserEmail,
  thisPlayerSeasonTotal,
  writeUserEmail,
  writeWeekCard,
} from './storage';
import {
  cutoffHasPassed,
  defaultWeekNumber,
  downloadSvg,
  encodeQrPayload,
  isValidEmail,
  parseQrPayload,
  qrFilename,
  realGames,
  REGULAR_SEASON_WEEKS,
  rowsFromWinnerAbbrs,
  weekClosesAt,
  weekHeading,
  type WeekCardRow,
} from './week';
import WeekRail, { decodeQrImageFile } from './WeekRail';

import type { NFLConfidenceResults } from '@/features/nfl-confidence-picks';
import type { NFLGame, NFLSeason } from '@/features/nfl-schedule';
import type { NFLStadium, NFLStadiumList } from '@/features/nfl-stadiums';
import type { NFLTeam, NFLTeamList } from '@/features/nfl-teams';

type WeekPicksProps = {
  results: NFLConfidenceResults | null;
  season: NFLSeason;
  stadiums: NFLStadiumList;
  teams: NFLTeamList;
};

function WeekPicks({ results, season, stadiums, teams }: WeekPicksProps) {
  const [weekNumber, setWeekNumber] = useState(() =>
    defaultWeekNumber(season, new Date()),
  );
  const [liveRows, setLiveRows] = useState<WeekCardRow[] | null>(null);
  const seasonPoints = thisPlayerSeasonTotal({
    currentRows: liveRows ?? undefined,
    currentWeekNumber: weekNumber,
    results,
    season,
    teams,
  });

  function handleWeekChange(_: unknown, value: number) {
    setLiveRows(null);
    setWeekNumber(value);
  }

  return (
    <Box>
      <Typography
        component="p"
        color="text.secondary"
        aria-live="polite"
        sx={{ mb: 2 }}
      >
        Season total: {seasonPoints} {seasonPoints === 1 ? 'point' : 'points'}
      </Typography>
      <Tabs
        value={weekNumber}
        onChange={handleWeekChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Season weeks"
        sx={{ mb: 2 }}
      >
        {Array.from({ length: REGULAR_SEASON_WEEKS }, (_, index) => (
          <Tab key={index + 1} value={index + 1} label={String(index + 1)} />
        ))}
      </Tabs>
      <WeekView
        key={weekNumber}
        onRowsChange={setLiveRows}
        results={results}
        season={season}
        stadiums={stadiums}
        teams={teams}
        weekNumber={weekNumber}
      />
    </Box>
  );
}

type WeekViewProps = {
  onRowsChange: (rows: WeekCardRow[]) => void;
  results: NFLConfidenceResults | null;
  season: NFLSeason;
  stadiums: NFLStadiumList;
  teams: NFLTeamList;
  weekNumber: number;
};

function WeekView({
  onRowsChange,
  results,
  season,
  stadiums,
  teams,
  weekNumber,
}: WeekViewProps) {
  const week = season.games.find((entry) => entry.weekNumber === weekNumber);
  const games = week ? realGames(week.games) : [];
  const closesAt = weekClosesAt(season, weekNumber);
  const frozen = cutoffHasPassed(closesAt);

  const [rows, setRows] = useState<WeekCardRow[]>(() =>
    loadWeekRows(weekNumber, week?.games ?? [], teams),
  );
  const [email, setEmail] = useState(() => readUserEmail());
  const [uploadError, setUploadError] = useState<string | null>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const teamsById = useMemo(
    () => new Map<string, NFLTeam>(teams.map((team) => [team.id, team])),
    [teams],
  );
  const stadiumsById = useMemo(
    () =>
      new Map<string, NFLStadium>(
        stadiums.map((stadium) => [stadium.id, stadium]),
      ),
    [stadiums],
  );
  const gamesById = useMemo(
    () => new Map<string, NFLGame>(games.map((game) => [game.id, game])),
    [games],
  );

  const n = rows.length;
  const picked = rows.filter((row) => row.winnerId).length;
  const resultsWeek = results?.weeks.find(
    (week) => week.weekNumber === weekNumber,
  );
  const weekScore = scoreWeek({
    card: rows,
    games,
    resultsWeek,
    weekNumber,
  });
  const resultsPosted = weekScore.status === 'posted';
  const boxScores =
    frozen && weekScore.status === 'posted'
      ? Object.fromEntries(
          weekScore.games.map((game) => [game.gameId, game.boxScore]),
        )
      : undefined;
  const railScore =
    frozen && weekScore.status === 'posted' ? weekScore.totals : null;
  const winners = rows.map((row) => row.winnerId);
  const complete =
    n > 0 && winners.every((winner): winner is string => winner !== null);
  const payload = complete
    ? encodeQrPayload(email.trim(), weekNumber, winners)
    : '';
  const entryValid =
    complete &&
    withWeek(games).safeParse({
      picks: rows.map((row, index) => ({
        confidence: n - index,
        gameId: row.gameId,
        winnerId: row.winnerId,
      })),
      weekNumber,
    }).success;
  const canExport =
    !frozen && complete && isValidEmail(email.trim()) && entryValid;

  function reloadIfClosed(): boolean {
    // A tab left open can still look open; snap shut instead of writing.
    if (cutoffHasPassed(closesAt)) {
      window.location.reload();
      return true;
    }
    return false;
  }

  function commitRows(next: WeekCardRow[]) {
    if (reloadIfClosed()) return;
    writeWeekCard({ rows: next, weekNumber });
    setRows(next);
    onRowsChange(next);
  }

  function handlePick(gameId: string, winnerId: string) {
    const next = rowsRef.current.map((row) =>
      row.gameId === gameId ? { ...row, winnerId } : row,
    );
    commitRows(next);
  }

  function handleReorder(fromId: string, toId: string) {
    const prev = rowsRef.current;
    const oldIndex = prev.findIndex((row) => row.gameId === fromId);
    const newIndex = prev.findIndex((row) => row.gameId === toId);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
    commitRows(arrayMove(prev, oldIndex, newIndex));
  }

  function handleMove(gameId: string, delta: number) {
    const prev = rowsRef.current;
    const index = prev.findIndex((row) => row.gameId === gameId);
    const nextIndex = index + delta;
    if (index < 0 || nextIndex < 0 || nextIndex >= prev.length) return;
    commitRows(arrayMove(prev, index, nextIndex));
  }

  function handleEmailChange(next: string) {
    setEmail(next);
    if (isValidEmail(next.trim())) {
      writeUserEmail(next.trim());
    }
  }

  function handleDownload(svg: SVGSVGElement) {
    if (reloadIfClosed()) return;
    if (!canExport) return;
    downloadSvg(svg, qrFilename(weekNumber, email.trim()));
  }

  async function handleUpload(file: File) {
    setUploadError(null);
    let decoded: string | null;
    try {
      decoded = await decodeQrImageFile(file);
    } catch {
      setUploadError('Could not read that image.');
      return;
    }
    if (!decoded) {
      setUploadError('No QR code found in the image.');
      return;
    }

    const parsed = parseQrPayload(decoded);
    if ('error' in parsed) {
      setUploadError(parsed.error);
      return;
    }
    if (parsed.weekNumber !== weekNumber) {
      setUploadError('QR week does not match the selected week');
      return;
    }

    const applied = rowsFromWinnerAbbrs(games, parsed.winners);
    if ('error' in applied) {
      setUploadError(applied.error);
      return;
    }

    const uploadedEntry = withWeek(games).safeParse({
      picks: applied.rows.map((row, index) => ({
        confidence: applied.rows.length - index,
        gameId: row.gameId,
        winnerId: row.winnerId,
      })),
      weekNumber,
    });
    if (!uploadedEntry.success) {
      setUploadError('QR does not match this week');
      return;
    }

    writeWeekCard({ rows: applied.rows, weekNumber });
    writeUserEmail(parsed.email);
    setRows(applied.rows);
    setEmail(parsed.email);
    onRowsChange(applied.rows);
  }

  return (
    <Box>
      <Typography id={`week-${weekNumber}-heading`} variant="h2" gutterBottom>
        {weekHeading(weekNumber, week?.games ?? [])}
      </Typography>
      <Box
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          flexDirection: { md: 'row', xs: 'column' },
          gap: 3,
          mt: 2,
        }}
      >
        <Box
          component="section"
          aria-labelledby={`week-${weekNumber}-heading`}
          sx={{ flex: { md: '2 1 0' }, minWidth: 0, width: '100%' }}
        >
          {n === 0 ? (
            <Typography component="p" color="text.secondary">
              No games for this week.
            </Typography>
          ) : (
            <GamePickList
              boxScores={boxScores}
              frozen={frozen}
              gamesById={gamesById}
              onMove={handleMove}
              onPick={handlePick}
              onReorder={handleReorder}
              rows={rows}
              stadiumsById={stadiumsById}
              teamsById={teamsById}
            />
          )}
        </Box>
        {n === 0 ? null : (
          <WeekRail
            canExport={canExport}
            closesAt={closesAt}
            email={email}
            frozen={frozen}
            n={n}
            onDownload={handleDownload}
            onEmailChange={handleEmailChange}
            onUploadFile={handleUpload}
            payload={payload}
            picked={picked}
            resultsPosted={frozen && resultsPosted}
            score={railScore}
            uploadError={uploadError}
          />
        )}
      </Box>
    </Box>
  );
}

export default WeekPicks;
