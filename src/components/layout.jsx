import * as React from "react";
import Footer from "./footer";

import "../styles/reset.scss";
import "../styles/page.scss";

function Layout({ pageTitle, children }) {
  return (
    <>
      <header>{pageTitle}</header>
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
