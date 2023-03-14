import * as React from "react";
import Footer from "./footer";
import Header from "./header";

import "../styles/reset.scss";
import "../styles/page.scss";

function Layout({ pageTitle, children }) {
  return (
    <>
      <Header title={pageTitle} />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
