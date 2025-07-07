import Papa from 'papaparse';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import type { Team } from './types';

// Import the CSV as raw text
import teamsCSV from './data/league/NFLTeamsByConfAndDiv.csv?raw';

function NFLPickem2025() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse<Team>(teamsCSV, {
      complete: (results) => {
        setTeams(results.data);
        setLoading(false);
      },
      header: true,
      skipEmptyLines: true,
    });
  }, []);

  if (loading) return <Box>Loading teams...</Box>;

  return (
    <Box component="div" sx={{ padding: (theme) => theme.spacing(2) }}>
      <h2>NFL Teams 2025</h2>
      <p>Loaded {teams.length} teams</p>

      {['AFC', 'NFC'].map((conference) => (
        <Box key={conference} sx={{ mb: 3 }}>
          <h3>{conference}</h3>
          {['East', 'North', 'South', 'West'].map((division) => {
            const divisionTeams = teams.filter(
              (team) =>
                team.Conference === conference && team.Division === division,
            );

            return (
              <Box key={division} sx={{ mb: 2, ml: 2 }}>
                <h4>{division}</h4>
                {divisionTeams.map((team, index) => (
                  <Box key={index} sx={{ ml: 2 }}>
                    <strong>{team.Abbr}</strong> - {team.Team}
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}

export default NFLPickem2025;
