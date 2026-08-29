import { Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import resultsJson from './data/results-2026.json';
import scheduleJson from './data/schedule-2026.json';
import stadiumsJson from './data/stadiums.json';
import teamsJson from './data/teams.json';
import { ingestResults, ingestSeason, type SeasonSources } from './ingest';
import IngestFixForm, { ResultsFixForm } from './IngestFixForm';
import IngestReject from './IngestReject';
import Page from '../../templates/Page';
import WeekPicks from './WeekPicks';

function cloneSources(): SeasonSources {
  return {
    schedule: structuredClone(scheduleJson), // https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
    stadiums: structuredClone(stadiumsJson),
    teams: structuredClone(teamsJson),
  };
}

function NFLConfidencePicks2026() {
  const [sources, setSources] = useState(cloneSources);
  const [resultsSource, setResultsSource] = useState<unknown>(() =>
    structuredClone(resultsJson),
  );
  const ingest = useMemo(() => ingestSeason(sources), [sources]);
  const resultsIngest = useMemo(() => {
    if (ingest.status !== 'valid') return null;
    return ingestResults(resultsSource, {
      seasonYear: ingest.season.year,
      teamIds: new Set(ingest.teams.map((team) => team.id)),
    });
  }, [ingest, resultsSource]);

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
        <>
          {resultsIngest?.status === 'unusable' ? (
            <IngestReject
              files={{ results: resultsIngest.issues }}
              summary="This results file cannot be used. Scores are not shown."
            />
          ) : null}

          {resultsIngest?.status === 'fixable' ? (
            <ResultsFixForm
              issues={resultsIngest.issues}
              value={resultsSource}
              onChange={setResultsSource}
            />
          ) : null}

          <WeekPicks
            results={
              resultsIngest?.status === 'valid' ? resultsIngest.results : null
            }
            season={ingest.season}
            stadiums={ingest.stadiums}
            teams={ingest.teams}
          />
        </>
      ) : null}
    </Page>
  );
}

export default NFLConfidencePicks2026;
