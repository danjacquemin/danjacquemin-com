import * as React from 'react';
import Layout from '../components/layout';
import { Seo } from '../components/seo';
import { Link } from 'gatsby';

import * as styles from './index.module.scss';

import logoTailwindSvg from '../images/tailwindcss-logotype.svg';

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
          <hr />
          <div>
            <p>
              While I'm building things, I like to take semi-formal notes on the
              technologies I use. This process has helped me immensely, and I
              hope my notes can help you too.
            </p>
            <ul className={styles.techList}>
              <li>
                <a href="/tailwind/">
                  <img src={logoTailwindSvg} alt="" height="25" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <aside className="wrapAside">♬♬ muzak ♬♬</aside>
      </div>
    </Layout>
  );
};

export const Head = () => <Seo title={title} />;

export default IndexPage;
