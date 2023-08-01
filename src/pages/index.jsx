import * as React from 'react';
import Layout from '../components/layout';
import { Seo } from '../components/seo';
// import { Link } from 'gatsby';

// -- -- --

const title = 'dan jacquemin . com';

// -- -- --

const IndexPage = () => {
  return (
    <Layout pageTitle={title}>
      <h1 className="pageTitle">
        <span className="pageFlair">Hello World</span>
      </h1>
      <div className="wrapFlex">
        <div className="wrapContents">
          <p>What the heck is going on here?!</p>
          <p>I'm rebuilding stuff and leaving cool notes. It is a process.</p>
        </div>
        <aside className="wrapAside">♬♬ muzak ♬♬</aside>
      </div>
    </Layout>
  );
};

export const Head = () => <Seo title={title} />;

export default IndexPage;
