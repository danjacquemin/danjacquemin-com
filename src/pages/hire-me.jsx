import * as React from "react";
import Layout from "../components/layout";
import { Seo } from "../components/seo";

// -- -- --

const title = "hire me | dan jacquemin . com";

// -- -- --

const IndexPage = () => {
  return (
    <Layout pageTitle={title}>
      <main>
        <h1>Hire me</h1>
        <p>
          For now, deets on
          <a href="https://www.linkedin.com/in/dan-jacquemin/">LinkedIn</a>.
          More here soon.
        </p>
      </main>
    </Layout>
  );
};

export const Head = () => <Seo title={title} />;

export default IndexPage;
