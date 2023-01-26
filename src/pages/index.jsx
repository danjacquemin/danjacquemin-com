import * as React from "react";
import Layout from "../components/layout";
import { Seo } from "../components/seo";

// -- -- --

const title = "dan jacquemin . com";

// -- -- --

const IndexPage = () => {
  return (
    <Layout pageTitle={title}>
      <main>
        <div>Hello World</div>
        <div>
          What the heck is going on here?! <br />
          Well, for the first time in a long time I'm rebuilding my personal
          site. <br />
          It is a process. <br />
          You can follow along on GitHub &mdash;{" "}
          <a href="https://github.com/danjacquemin/danjacquemin-com">
            github.com/danjacquemin/danjacquemin-com
          </a>
        </div>
      </main>
    </Layout>
  );
};

export const Head = () => <Seo title={title} />;

export default IndexPage;
