import { Link } from "react-router-dom";
import ThemeSwitcher from "../ThemeSwitcher";

const navItems = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "About",
    path: "/about",
  },
  {
    name: "Swag",
    path: "/swag",
  },
];

const PageHeader = () => (
  <>
    <header className="px-2 pt-2 text-right">
      <Link to="/" className="no-underline">
        dan jacquemin . com
      </Link>
    </header>
    <nav>
      <ul className="-mr-2 flex list-none justify-end p-2">
        {navItems.map((item) => (
          <li key={item.path} className="text-sm">
            <Link to={item.path} className="px-2">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
    <ThemeSwitcher />
  </>
);

export default PageHeader;
