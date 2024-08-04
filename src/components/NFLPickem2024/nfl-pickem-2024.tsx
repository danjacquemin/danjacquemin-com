import React, { useState } from "react";
import scheduleData from "./json/nfl2024.json";
import teamsData from "./json/teams.json";

type Team = {
  name: string;
  conference: string;
  division: string;
  nickname: string;
  abv: string;
  wins?: number;
  losses?: number;
  schedule?: string[];
};

type TeamsData = {
  [key: string]: Team;
};

type Schedule = {
  week: number;
  date: string;
  time: string;
  away: string;
  home: string;
  stadium: string;
  city: string;
  state: string;
}[];

const schedule: Schedule = scheduleData;

// This is problem because of ...teamsData[key] :(
// but why?
// maybe -- https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
// -- -- -- --
// const initialTeams: TeamsData = Object.keys(teamsData).reduce(
//   (acc, key: string) => {
//     acc[key] = {
//       ...teamsData[key],
//       wins: 0,
//       losses: 0,
//       schedule: new Array(19).fill("-"),
//     };
//     return acc;
//   },
//   {} as TeamsData,
// );

const initialTeams: TeamsData = teamsData;
Object.values(initialTeams).forEach((team) => {
  team.schedule = new Array(19).fill("-");
  team.wins = 0;
  team.losses = 0;
});

const NFLPickem2024 = (): JSX.Element => {
  const [season, setSeason] = useState<TeamsData>(initialTeams);

  // a list of all the weeks in the schedule
  const weeks = Array.from(new Set(schedule.map((game) => game.week)));

  // a list of all the conferences in the teams data
  const conferences = Array.from(
    new Set(Object.values(season).map((team) => team.conference)),
  ).sort();

  // a list of all the divisions in each conference in the teams data
  // a space for the conferences
  const teamsByConferenceAndDivision: {
    [conference: string]: { [division: string]: string[] };
  } = {};

  // a space for the divisions
  conferences.forEach((conference) => {
    teamsByConferenceAndDivision[conference] = {};
  });

  // all the teams in each division in each conference
  Object.values(season).forEach((team) => {
    if (!teamsByConferenceAndDivision[team.conference][team.division]) {
      teamsByConferenceAndDivision[team.conference][team.division] = [];
    }
    teamsByConferenceAndDivision[team.conference][team.division].push(
      team.name,
    );
  });

  // console.log(schedule);
  // console.log(initialTeams);
  // console.log(teamsByConferenceAndDivision);

  // -- -- -- --
  //
  const teamClassNames =
    "group rounded hover:bg-gray-200 px-2 w-60 flex items-center [&.winner]:bg-green-700 [&.winner]:text-white cursor-pointer";

  // -- -- --

  /**
   * Converts a team name to its abbreviation.
   * @param teamName - The name of the team.
   * @returns The abbreviation of the team.
   */
  const convertTeamNameToAbv = (teamName: string): string => {
    const team = Object.values(teamsData).find(
      (team) => team.name === teamName,
    ) as Team;
    return team.abv;
  };

  // -- -- --

  /**
   * Updates the schedule for a specific team in the NFL Pickem 2024 component.
   *
   * @param {string} teamName - The name of the team.
   * @param {number} week - The week number.
   * @param {string} result - The result of the game.
   */
  const updateTeamSchedule = (
    teamName: string,
    week: number,
    result: string,
  ) => {
    setSeason((prevSeason) => ({
      ...prevSeason,
      [teamName]: {
        ...prevSeason[teamName],
        schedule: prevSeason[teamName].schedule!.map((item, index) =>
          index === week ? result : item,
        ),
        wins: prevSeason[teamName]
          .schedule!.map((item, index) => (index === week ? result : item))
          .filter((item) => item === "W").length,
        losses: prevSeason[teamName]
          .schedule!.map((item, index) => (index === week ? result : item))
          .filter((item) => item === "L").length,
      },
    }));
  };

  /**
   * Handles the click event on a team cell in the NFL Pickem 2024 component.
   * To set the winner of a game, the user clicks on the team cell of the winning team.
   * If the selected team current the winner of the row, unselect it.
   * Updates the season data with the win/loss/reset for each team in the row.
   *
   * @param event - The click event.
   * @param week - The week number.
   * @returns {void}
   */
  const handleTeamClick = (
    event: React.MouseEvent<HTMLTableCellElement>,
    week: number,
  ) => {
    const winnerCell = event.currentTarget;
    const row = winnerCell.parentElement;
    const rowAwayCell = row!.querySelector("td:nth-child(3)")!;
    const rowHomeCell = row!.querySelector("td:nth-child(5)")!;

    const loserCell = winnerCell === rowAwayCell ? rowHomeCell : rowAwayCell;

    const winnerTeam = convertTeamNameToAbv(winnerCell.textContent!);
    const loserTeam = convertTeamNameToAbv(loserCell.textContent!);

    console.log(`${week} | ${winnerTeam} | ${loserTeam}`);

    // if the selected cell is already the winner, unselect it
    // and reset the win/loss in the season
    if (winnerCell.classList.contains("winner")) {
      rowAwayCell.classList.remove("winner");
      rowHomeCell.classList.remove("winner");

      updateTeamSchedule(winnerTeam, week, "-");
      updateTeamSchedule(loserTeam, week, "-");
    } else {
      rowAwayCell.classList.remove("winner");
      rowHomeCell.classList.remove("winner");
      winnerCell.classList.add("winner");

      updateTeamSchedule(winnerTeam, week, "W");
      updateTeamSchedule(loserTeam, week, "L");
    }
    return;
  };

  /**
   * Scrolls to the specified week element when clicked.
   * @param game - The game number of the week element to scroll to.
   */
  const handleWeekClick = (game: number) => {
    const element = document.getElementById(`week-${game}`);
    element?.scrollIntoView({
      behavior: "smooth",
    });
  };

  /**
   * Resets the season and clears the winner cells.
   * @returns {void}
   */
  const handleSeasonReset = () => {
    if (
      window.confirm(
        "\nAre you sure you want to reset the season?\n\n!! This is not recoverable !!",
      )
    ) {
      setSeason(initialTeams);
      document.querySelectorAll("td.winner").forEach((cell) => {
        cell.classList.remove("winner");
      });
    }
  };

  return (
    <>
      <section className="no-innards min-w-[700px] basis-1/2">
        <div className="flex pb-32">
          <div className="pr-6 print:hidden">
            <h2>Games</h2>
            {weeks.map((week) => (
              <table key={week} id={`week-${week}`} className="mt-4">
                <thead>
                  <tr>
                    <th
                      colSpan={5}
                      className="bg-gray-200 pl-2 text-left"
                      scope="col"
                    >
                      Week: {week}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule
                    .filter((game) => game.week === week)
                    .map((game) => (
                      <tr key={`${game.away}-${game.home}`}>
                        {game.date === "Bye" ? (
                          <>
                            <td colSpan={2} className="pr-[18px] text-right">
                              Bye
                            </td>
                            <td colSpan={3} className="pl-[2em]">
                              {game.home}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="w-8 pl-2">
                              {game.date.slice(0, 3)}
                            </td>
                            <td className="w-20 text-nowrap pl-2">
                              {game.time}
                            </td>
                            <td
                              className={teamClassNames}
                              tabIndex={0}
                              onClick={(event) => handleTeamClick(event, week)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                className={`invisible mr-2 inline h-4 w-4 fill-white group-[&.winner]:visible`}
                                aria-hidden="true"
                              >
                                <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2l144 0c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48l-97.5 0c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3l0-38.3 0-48 0-24.9c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192l64 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32L0 224c0-17.7 14.3-32 32-32z" />
                              </svg>
                              <span>{game.away}</span>
                            </td>
                            <td>@</td>
                            <td
                              className={teamClassNames}
                              tabIndex={0}
                              onClick={(event) => handleTeamClick(event, week)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                className={`invisible mr-2 inline h-4 w-4 fill-white group-[&.winner]:visible`}
                                aria-hidden="true"
                              >
                                <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2l144 0c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48l-97.5 0c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3l0-38.3 0-48 0-24.9c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192l64 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32L0 224c0-17.7 14.3-32 32-32z" />
                              </svg>
                              <span>{game.home}</span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            ))}
          </div>
          <div className="relative border-l">
            <div className="sticky top-0 pl-6 text-sm">
              <div className="flex items-center">
                <h2>Results</h2>
                <p className="m-0 mx-8 p-0">
                  <button
                    type="button"
                    onClick={handleSeasonReset}
                    className="rounded-xl border border-black px-4 hover:bg-black hover:text-white print:hidden"
                  >
                    Reset
                  </button>
                </p>
              </div>

              {Object.entries(teamsByConferenceAndDivision).map(
                ([conference, divisions]) => (
                  <div key={conference}>
                    <h3>{conference}</h3>
                    <table>
                      <tbody>
                        {Object.entries(divisions)
                          .sort()
                          .map(([division, teams]) => (
                            <React.Fragment key={division}>
                              <tr>
                                <td
                                  rowSpan={5}
                                  className="w-24 text-nowrap align-top"
                                >
                                  {division}
                                </td>
                              </tr>
                              {teams.sort().map((team) => (
                                <tr key={team}>
                                  <td className="w-56 text-nowrap">{team}</td>
                                  <td className="text-nowrap">
                                    {season[
                                      convertTeamNameToAbv(team)
                                    ].schedule?.map(
                                      (game, index) =>
                                        index !== 0 && (
                                          <span
                                            key={index}
                                            className={`${game === "W" ? "bg-green-700 text-white" : game === "L" ? "bg-red-600 text-white" : ""} inline-block w-6 border text-center text-sm`}
                                            onClick={() => {
                                              handleWeekClick(index);
                                            }}
                                          >
                                            {game}
                                          </span>
                                        ),
                                    )}
                                  </td>
                                  <td className="text-nowrap px-3 text-sm">
                                    {season[convertTeamNameToAbv(team)].wins! +
                                      season[convertTeamNameToAbv(team)]
                                        .losses!}{" "}
                                    of 17
                                  </td>
                                  <td className="text-sm">
                                    {season[convertTeamNameToAbv(team)].wins}-
                                    {season[convertTeamNameToAbv(team)].losses}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default NFLPickem2024;
