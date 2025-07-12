import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import React from 'react';

import type { UserPicks, WeeklyScheduleData } from '../types';

import GameTable from './GameTable';
import PicksResetButton from './PicksResetButton';
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

export default function WeekAccordion({
  defaultExpanded = false,
  formatGameTime,
  getTeamAbbr,
  handlePickChange,
  setUserPicks,
  userPicks,
  weeklySchedule,
  weekNum,
}: WeekAccordionProps) {
  const weekData = weeklySchedule[weekNum];
  const totalGames = Object.values(weekData.gamesByDay).flat().length;

  return (
    <Accordion sx={{ mb: 3 }} disableGutters defaultExpanded={defaultExpanded}>
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
          <Typography variant="h2">
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

      <AccordionDetails>
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

        {weekData.byes.length > 0 && (
          <Box sx={{ mt: 2, pl: 8 }} fontSize="0.875rem">
            <Typography fontSize={'inherit'} gutterBottom>
              On Bye:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography component="span" fontSize={'inherit'}>
                {weekData.byes.join(', ')}
              </Typography>
            </Box>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
