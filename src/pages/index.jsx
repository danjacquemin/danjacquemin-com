import * as React from "react";
import Layout from "../components/layout";
import { Seo } from "../components/seo";

import * as styles from "./index.module.scss";

// -- -- --

const title = "dan jacquemin . com";

// -- -- --

const IndexPage = () => {
  return (
    <Layout pageTitle={title}>
      <h1>Hello World</h1>
      <div className={styles.wrapFlex}>
        <div className={styles.wrapContents}>
          <p>What the heck is going on here?!</p>
          <p>
            Well, for the first time in a long time I'm rebuilding my personal
            site.
          </p>
          <p>It is a process.</p>
          <p>
            You can follow along on GitHub &mdash;{" "}
            <a href="https://github.com/danjacquemin/danjacquemin-com">
              github.com/danjacquemin/danjacquemin-com
            </a>
          </p>
        </div>
        <aside className={styles.wrapAside}>muzak</aside>
      </div>
    </Layout>
  );
};

export const Head = () => <Seo title={title} />;

export default IndexPage;
