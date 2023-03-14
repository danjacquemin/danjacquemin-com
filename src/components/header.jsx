import React from "react";

import * as styles from "./header.module.scss";

// -- -- --

export const Header = ({ title }) => {
  const heading = {
    title: title || "dan jacquemin . com",
  };

  return (
    <header>
      <div className={styles.header}>
        <div className={styles.title}>{heading.title}</div>
      </div>
    </header>
  );
};

export default Header;
