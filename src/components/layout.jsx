import * as React from "react";
import Footer from "./footer";

import "../styles/reset.scss";
import "../styles/page.scss";

function Layout({ pageTitle, children }) {
  return (
    <div>
      <main>
        <h1>{pageTitle}</h1>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
