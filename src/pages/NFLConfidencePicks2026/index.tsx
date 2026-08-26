import { Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import scheduleJson from './data/schedule-2026.json';
import stadiumsJson from './data/stadiums.json';
import teamsJson from './data/teams.json';
import { ingestSeason, type SeasonSources } from './ingest';
import IngestFixForm from './IngestFixForm';
import IngestReject from './IngestReject';
import SeasonWeekList from './SeasonWeekList';
import Page from '../../templates/Page';

function cloneSources(): SeasonSources {
  return {
    schedule: structuredClone(scheduleJson),
    stadiums: structuredClone(stadiumsJson),
    teams: structuredClone(teamsJson),
  };
}

function NFLConfidencePicks2026() {
  const [sources, setSources] = useState(cloneSources);
  const ingest = useMemo(() => ingestSeason(sources), [sources]);

  return (
    <Page title="NFL Confidence Picks">
      <Typography variant="h1">NFL Confidence Picks</Typography>
      {ingest.status === 'unusable' ? (
        <IngestReject files={ingest.files} />
      ) : null}
      {ingest.status === 'fixable' ? (
        <IngestFixForm
          files={ingest.files}
          sources={sources}
          onChange={setSources}
        />
      ) : null}
      {ingest.status === 'valid' ? (
        <SeasonWeekList
          season={ingest.season}
          stadiums={ingest.stadiums}
          teams={ingest.teams}
        />
      ) : null}
    </Page>
  );
}

export default NFLConfidencePicks2026;
