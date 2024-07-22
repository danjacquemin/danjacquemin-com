import scheduleData from "./json/schedule.json";

type Game = { away: string; home: string; date: string; time: string };
type Schedule = { [key: string]: Game[] };

/**
 * Renders the NFLPickem2024 component.
 *
 * @returns {JSX.Element} The rendered NFLPickem2024 component.
 */
const NFLPickem2024 = (): JSX.Element => {
  const weeks = Object.keys(scheduleData);
  const schedule: Schedule = scheduleData;

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  /**
   * Formats a string by uppercasing the first letter and replacing dashes with spaces.
   * @param {string} input - The input string to be formatted.
   * @returns {string} - The formatted string.
   */
  const formatWeek = (input: string): string => {
    return input.replace(/-/g, " ").replace(/^./, (str) => str.toUpperCase());
  };

  /**
   * Creates a new Date object from a string in the format YYYY-MM-DD.
   * @param {string} dateString - The date string in the format YYYY-MM-DD.
   * @returns {string} - The day of the week as a string
   */
  const getDay = (dateString: string): string => {
    const [year, month, day] = dateString.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day); // Month is 0-indexed
    const dayIndex = dateObj.getDay();
    return weekdays[dayIndex] || "";
  };

  const teamClassNames =
    "w-12 rounded text-center hover:bg-gray-400 hover:font-bold cursor-pointer";

  return (
    <section className="no-innards min-w-[700px] basis-1/2">
      <div>
        {weeks.map((week) => (
          <table key={week}>
            <tr>
              <th colSpan={6} className="text-left">
                {formatWeek(week)} :: 0 of {schedule[week].length} games
              </th>
            </tr>
            {schedule[week].map((game, index) => {
              return (
                <tr key={`${index}-${game.home}`}>
                  <td className={teamClassNames} tabIndex={0}>
                    {game.away}
                  </td>
                  <td className="w-6 text-center">at</td>
                  <td className={teamClassNames} tabIndex={0}>
                    {game.home}
                  </td>
                  <td className="text-right">{getDay(game.date)}</td>
                  <td className="w-6">at</td>
                  <td>{game.time}</td>
                </tr>
              );
            })}
          </table>
        ))}
      </div>
    </section>
  );
};

export default NFLPickem2024;
