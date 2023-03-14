import * as React from "react";
import Layout from "../components/layout";
import { Seo } from "../components/seo";

// -- -- --

const title = "dan jacquemin . com";

// -- -- --

const IndexPage = () => {
  return (
    <Layout pageTitle={title}>
      <h1 className="pageTitle">
        <span class="pageFlair">Hello World</span>
      </h1>
      <div className="wrapFlex">
        <div className="wrapContents">
          <p>What the heck is going on here?!</p>
          <p>I'm rebuilding stuff and leaving cool notes. It is a process.</p>
          <p>
            You can follow along on GitHub &mdash;{" "}
            <a href="https://github.com/danjacquemin/danjacquemin-com">
              github.com/danjacquemin/danjacquemin-com
            </a>
          </p>
          <h2>Or, and Hear Me Out&hellip;</h2>
          <ul>
            <li>Front-end Style Things I like</li>
            <li>
              <tt>#a11y</tt> Stuff of Note
            </li>
          </ul>
        </div>
        <aside className="wrapAside">♬♬ muzak ♬♬</aside>
      </div>
    </Layout>
  );
};

export const Head = () => <Seo title={title} />;

export default IndexPage;
