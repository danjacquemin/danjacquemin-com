import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import { memo, useMemo } from 'react';

import type { UserPicks, WeeklyScheduleData } from '../types';

import ByeTeams from './ByeTeams';
import GameTable from './GameTable';
import PicksResetButton from './PicksResetButton';
import { isValidWeek } from '../utils/gameUtils';
import { getPicksForWeek } from '../utils/gameUtils';
import { getWeekDateRange } from '../utils/scheduleUtils';

interface WeekAccordionProps {
  weekNum: number;
  weeklySchedule: WeeklyScheduleData;
  userPicks: UserPicks;
  setUserPicks: (picks: UserPicks) => void;
  getTeamAbbr: (teamName: string) => string;
  formatGameTime: (utcDateTime: string) => string;
  handlePickChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  defaultExpanded?: boolean;
}

/**
 * Validates weekly schedule and week data
 */
const isValidWeekData = (
  weeklySchedule: WeeklyScheduleData,
  weekNum: number,
): boolean => {
  return (
    weeklySchedule !== null &&
    typeof weeklySchedule === 'object' &&
    !!weeklySchedule[weekNum] &&
    !!weeklySchedule[weekNum].gamesByDay
  );
};

/**
 * Accordion component for displaying weekly NFL games and picks
 */
const WeekAccordion = memo(
  ({
    defaultExpanded = false,
    formatGameTime,
    getTeamAbbr,
    handlePickChange,
    setUserPicks,
    userPicks,
    weeklySchedule,
    weekNum,
  }: WeekAccordionProps) => {
    // Validate inputs
    if (!isValidWeek(weekNum)) {
      console.warn(`Invalid week number: ${weekNum}`);
      return null;
    }
    if (!isValidWeekData(weeklySchedule, weekNum)) {
      console.warn(`Invalid or missing week data for week ${weekNum}`);
      return null;
    }
    if (typeof getTeamAbbr !== 'function') {
      console.error('getTeamAbbr is not a function');
      return null;
    }

    const weekData = weeklySchedule[weekNum];
    // Memoize total games calculation
    const totalGames = useMemo(
      () => Object.values(weekData.gamesByDay).flat().length,
      [weekData],
    );

    return (
      <Accordion
        sx={{ mb: 3 }}
        disableGutters
        defaultExpanded={defaultExpanded}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`week-${weekNum}-content`}
          id={`week-${weekNum}-header`}
          sx={{ alignItems: 'center', display: 'flex', gap: 2 }}
        >
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              gap: 2,
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Typography variant="h4">
              Week {weekNum} {getWeekDateRange(weekData)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 'normal',
                ml: 1,
              }}
            >
              {getPicksForWeek(userPicks, weekNum)} of {totalGames} picks
            </Typography>
          </Box>
        </AccordionSummary>

        <AccordionDetails role="region" aria-label={`Week ${weekNum} details`}>
          <PicksResetButton
            weekNum={weekNum}
            userPicks={userPicks}
            setUserPicks={setUserPicks}
          />

          <GameTable
            weekNum={weekNum}
            weekData={weekData}
            userPicks={userPicks}
            getTeamAbbr={getTeamAbbr}
            formatGameTime={formatGameTime}
            handlePickChange={handlePickChange}
          />

          {weekData.byes && weekData.byes.length > 0 && (
            <ByeTeams byeTeams={weekData.byes} />
          )}
        </AccordionDetails>
      </Accordion>
    );
  },
);

WeekAccordion.displayName = 'WeekAccordion';

export default WeekAccordion;
