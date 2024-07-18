import { Link } from "react-router-dom";
import ThemeSwitcher from "../ThemeSwitcher";

type NavItem = {
  name: string;
  path: string;
  hasMenu?: boolean;
  menuLinks?: string[];
};

const navItems: NavItem[] = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "About",
    path: "/about",
  },
  {
    name: "Flotsam",
    path: "/flotsam",
    // hasMenu: true,
    // menuLinks: ["1", "2"],
  },
  {
    name: "Jetsam",
    path: "/jetsam",
  },
];

const PageHeader = () => {
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.target as HTMLButtonElement;
    const menu = button.nextElementSibling as HTMLUListElement;
    const expanded = button.getAttribute("aria-expanded") === "true" || false;
    button.setAttribute("aria-expanded", String(!expanded));
    menu.hidden = expanded;
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const anchor = e.target as HTMLAnchorElement;
    const menu = anchor.closest("ul") as HTMLUListElement;
    const button = menu.previousElementSibling as HTMLButtonElement;
    const expanded = button.getAttribute("aria-expanded") === "true" || false;
    button.setAttribute("aria-expanded", String(!expanded));
    menu.hidden = expanded;
  };

  return (
    <>
      <header className="px-2 pt-2 text-right">
        <Link to="/" className="no-underline">
          dan jacquemin . com
        </Link>
      </header>
      <nav>
        <ul className="-mr-2 flex list-none justify-end p-2">
          {navItems.map((item) => (
            <li key={item.name} className="mx-2">
              {item.hasMenu ? (
                <div className="haspopup">
                  <button
                    type="button"
                    id={`${item.name}-btn`}
                    aria-haspopup="true"
                    aria-controls={`${item.name}-menu`}
                    aria-expanded="false"
                    onClick={handleButtonClick}
                  >
                    {`${item.name}`}
                  </button>
                  <ul
                    id={`${item.name}-menu`}
                    role="menu"
                    aria-labelledby={`${item.name}-btn`}
                  >
                    {/* <li role="none">
                      <Link
                        role="menuitem"
                        to={`${item.path}`}
                        onClick={handleAnchorClick}
                      >
                        /
                      </Link>
                    </li> */}
                    {item.menuLinks?.map((link) => {
                      return (
                        <li role="none" key={link}>
                          <Link
                            role="menuitem"
                            to={`${link}`}
                            onClick={handleAnchorClick}
                          >
                            {link}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <Link to={item.path}>{item.name}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <ThemeSwitcher />
    </>
  );
};

export default PageHeader;
