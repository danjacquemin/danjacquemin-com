import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragIndicator } from '@mui/icons-material';
import { Box, ButtonBase, Typography } from '@mui/material';

import { useTheme } from '@mui/material/styles';

import { formatKickoffEt, teamDisplayName, type WeekCardRow } from './week';

import type { NFLGame } from '@/features/nfl-schedule';
import type { NFLStadium } from '@/features/nfl-stadiums';
import type { NFLTeam } from '@/features/nfl-teams';

import type { DragEndEvent } from '@dnd-kit/core';
import type { KeyboardEvent } from 'react';

type GamePickListProps = {
  frozen: boolean;
  gamesById: Map<string, NFLGame>;
  onMove: (gameId: string, delta: number) => void;
  onPick: (gameId: string, winnerId: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  rows: WeekCardRow[];
  stadiumsById: Map<string, NFLStadium>;
  teamsById: Map<string, NFLTeam>;
};

function GamePickList({
  frozen,
  gamesById,
  onMove,
  onPick,
  onReorder,
  rows,
  stadiumsById,
  teamsById,
}: GamePickListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = rows.map((row) => row.gameId);
  const n = rows.length;

  function handleDragEnd(event: DragEndEvent) {
    if (frozen) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <Box
          component="ol"
          aria-label="Games by confidence, highest rank at the top"
          sx={{ listStyle: 'none', m: 0, p: 0 }}
        >
          {rows.map((row, index) => {
            const game = gamesById.get(row.gameId);
            if (!game) return null;
            return (
              <GamePickRow
                key={row.gameId}
                frozen={frozen}
                game={game}
                onMove={onMove}
                onPick={onPick}
                rank={n - index}
                stadiumsById={stadiumsById}
                teamsById={teamsById}
                winnerId={row.winnerId}
              />
            );
          })}
        </Box>
      </SortableContext>
    </DndContext>
  );
}

type GamePickRowProps = {
  frozen: boolean;
  game: NFLGame;
  onMove: (gameId: string, delta: number) => void;
  onPick: (gameId: string, winnerId: string) => void;
  rank: number;
  stadiumsById: Map<string, NFLStadium>;
  teamsById: Map<string, NFLTeam>;
  winnerId: string | null;
};

function GamePickRow({
  frozen,
  game,
  onMove,
  onPick,
  rank,
  stadiumsById,
  teamsById,
  winnerId,
}: GamePickRowProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ disabled: frozen, id: game.id });

  function handleRowKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    if (frozen || isDragging) return;
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      onMove(game.id, -1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      onMove(game.id, 1);
    }
  }

  const stadiumName =
    game.stadiumId === null
      ? null
      : (stadiumsById.get(game.stadiumId)?.stadiumName ?? null);
  const kickoff = formatKickoffEt(game.gameDateTimeUTC);
  const deets = stadiumName ? `${kickoff} · ${stadiumName}` : kickoff;

  return (
    <Box
      ref={setNodeRef}
      component="li"
      tabIndex={frozen ? -1 : 0}
      onKeyDown={handleRowKeyDown}
      aria-label={`${teamPairLabel(game, teamsById)}, rank ${rank}`}
      sx={{
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        opacity: isDragging ? 0.6 : 1,
        py: 1,
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
      }}
    >
      {frozen ? (
        <Box sx={{ flexShrink: 0, width: 32 }} />
      ) : (
        <Box
          ref={setActivatorNodeRef}
          component="button"
          type="button"
          aria-label="Drag to change rank"
          {...attributes}
          {...listeners}
          sx={{
            alignItems: 'center',
            background: 'none',
            border: 0,
            color: 'text.secondary',
            cursor: 'grab',
            display: 'flex',
            flexShrink: 0,
            p: 0.5,
            touchAction: 'none',
          }}
        >
          <DragIndicator fontSize="small" />
        </Box>
      )}
      <Typography
        component="span"
        aria-hidden="true"
        sx={{
          flexShrink: 0,
          fontFamily: '"Inconsolata", ui-monospace, monospace',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
          minWidth: '2ch',
          textAlign: 'right',
        }}
      >
        {rank}
      </Typography>
      <TeamPick
        frozen={frozen}
        gameId={game.id}
        onPick={onPick}
        selected={winnerId === game.awayTeamId}
        team={teamsById.get(game.awayTeamId)}
        teamId={game.awayTeamId}
        winnerId={winnerId}
      />
      <Typography component="span" sx={{ color: 'text.secondary', px: 0.5 }}>
        vs
      </Typography>
      <TeamPick
        frozen={frozen}
        gameId={game.id}
        onPick={onPick}
        selected={winnerId === game.homeTeamId}
        team={teamsById.get(game.homeTeamId)}
        teamId={game.homeTeamId}
        winnerId={winnerId}
      />
      <Typography
        component="span"
        sx={{
          color: 'text.secondary',
          flex: '1 1 auto',
          fontSize: '0.875rem',
          ml: { md: 1 },
          minWidth: '8rem',
          textAlign: { md: 'right' },
        }}
      >
        {deets}
      </Typography>
    </Box>
  );
}

type TeamPickProps = {
  frozen: boolean;
  gameId: string;
  onPick: (gameId: string, winnerId: string) => void;
  selected: boolean;
  team: NFLTeam | undefined;
  teamId: string;
  winnerId: string | null;
};

function TeamPick({
  frozen,
  gameId,
  onPick,
  selected,
  team,
  teamId,
  winnerId,
}: TeamPickProps) {
  const theme = useTheme();
  const name = teamDisplayName(team, teamId);
  const recedes = Boolean(winnerId) && !selected;
  const logo = team?.logos[0];
  const preferred =
    theme.palette.mode === 'dark'
      ? (logo?.knockoutLogo ?? logo?.colorLogo)
      : logo?.colorLogo;
  const fallback = `/svg/nfl-logos/${(team?.teamAbbreviation ?? teamId).toUpperCase()}.svg`;
  const src = preferred || fallback;

  return (
    <ButtonBase
      disabled={frozen}
      onClick={() => onPick(gameId, teamId)}
      aria-label={`Pick ${name} to win`}
      aria-pressed={selected}
      sx={{
        alignItems: 'center',
        borderRadius: 1,
        display: 'flex',
        flex: '1 1 0',
        fontWeight: selected ? 700 : 400,
        gap: 1,
        justifyContent: 'flex-start',
        minWidth: 0,
        opacity: recedes ? 0.4 : 1,
        outline: selected
          ? `2px solid ${theme.palette.primary.main}`
          : '2px solid transparent',
        outlineOffset: '-2px',
        p: 0.75,
        textAlign: 'left',
      }}
    >
      <Box
        component="img"
        src={src}
        alt=""
        onError={(event) => {
          if (event.currentTarget.src.endsWith(fallback)) return;
          event.currentTarget.src = fallback;
        }}
        sx={{ flexShrink: 0, height: 40, width: 40 }}
      />
      <Typography component="span" sx={{ lineHeight: 1.2, minWidth: 0 }}>
        {name}
      </Typography>
    </ButtonBase>
  );
}

function teamPairLabel(game: NFLGame, teamsById: Map<string, NFLTeam>): string {
  const away = teamDisplayName(teamsById.get(game.awayTeamId), game.awayTeamId);
  const home = teamDisplayName(teamsById.get(game.homeTeamId), game.homeTeamId);
  return `${away} vs ${home}`;
}

export default GamePickList;
