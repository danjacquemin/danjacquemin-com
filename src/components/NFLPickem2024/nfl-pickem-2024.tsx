import scheduleData from "./json/nfl2024.json";

interface Game {
  week: number;
  date: string;
  time: string;
  away: string;
  home: string;
  stadium: string;
  city: string;
  state: string;
}

type Schedule = Game[];

/**
 * Renders the NFLPickem2024 component.
 *
 * @returns {JSX.Element} The rendered NFLPickem2024 component.
 */
const NFLPickem2024 = (): JSX.Element => {
  const schedule: Schedule = scheduleData;
  const weeks = Array.from(new Set(schedule.map((game) => game.week)));

  const handleClickAway = (event: React.MouseEvent<HTMLTableCellElement>) => {
    const team = event.currentTarget.textContent;
    const row = event.currentTarget.parentElement;
    row?.classList.remove("winner-home");
    row?.classList.add("winner-away");
  };
  const handleClickHome = (event: React.MouseEvent<HTMLTableCellElement>) => {
    const team = event.currentTarget.textContent;
    const row = event.currentTarget.parentElement;
    row?.classList.remove("winner-away");
    row?.classList.add("winner-home");
  };

  const teamClassNames = "rounded hover:bg-gray-200 px-2 focus:bg-gray-200";

  return (
    <section className="no-innards min-w-[700px] basis-1/2">
      <div>
        {weeks.map((week) => (
          <table key={week}>
            <thead>
              <tr>
                <th colSpan={3} className="text-left" scope="col">
                  Week: {week}
                </th>
              </tr>
              <tr>
                <th className="w-20 text-left" scope="col">
                  Day
                </th>
                <th className="w-20 text-left" scope="col">
                  Time
                </th>
                <th className="w-8"></th>
                <th className="w-52 text-left" scope="col">
                  Away
                </th>
                <th className="w-52 text-left" scope="col">
                  Home
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {schedule
                .filter((game) => game.week === week)
                .map((game) => (
                  <tr key={`${game.away}-${game.home}`}>
                    <td>{game.date.slice(0, 3)}</td>
                    <td>{game.time}</td>
                    <td></td>
                    <td
                      className={teamClassNames}
                      tabIndex={0}
                      onClick={handleClickAway}
                    >
                      {game.away}
                    </td>
                    <td
                      className={teamClassNames}
                      tabIndex={0}
                      onClick={handleClickHome}
                    >
                      {game.home}
                    </td>
                    <td></td>
                  </tr>
                ))}
            </tbody>
          </table>
        ))}
      </div>
    </section>
  );
};

export default NFLPickem2024;
