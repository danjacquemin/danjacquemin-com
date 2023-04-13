import React, { useState } from "react";
import Layout from "../../components/layout";
import { Seo } from "../../components/seo";

import { createGlobalStyle } from "styled-components";
import styled from "styled-components";

import { CodeBlock, googlecode } from "react-code-blocks";

// -- -- --

const title = "color-mix | dan jacquemin . com";

// -- -- --

const GlobalStyle = createGlobalStyle`
  :root {
    --diameter: 200px;
    --color-mix-sample-width: 400px;

    --navy: #003082;
    --midnight: #003356;
    --purple: #630f54;
    --red: #a03137;
    --dark-green: #165736;
    --teal: #077f83;
  }
`;

const MaxWidthDiv = styled.div`
  max-width: var(--color-mix-sample-width);
`;

const WrapColorSample = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--color-mix-sample-width);
  height: 225px;
  background-image: url(https://i.kym-cdn.com/entries/icons/original/000/023/464/wowowne.jpg);
  background-repeat: no-repeat;
  background-size: contain;
  border: 2px solid black;
`;

const ColorSample = styled.div`
  background-color: ${(props) => props.percentMix};
  width: var(--diameter);
  height: var(--diameter);
  border: 2px solid black;
  border-radius: 50%;
`;

const SrOnlyLabel = styled.label`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;

const SelectColor = styled.select`
  margin: 1em auto 0.5em;
  padding: 0.2em 0.5em;
  font-size: 1em;
  border-radius: 8px;
`;

const Ul = styled.ul`
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 0.5em 0;
  max-width: var(--color-mix-sample-width);
  list-style-type: none;
`;

const Li = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2em;
  height: 2em;
  font-size: 0.875em;
  border: 1px solid black;
  border-radius: 50%;
  text-align: center;

  span {
    display: block;
  }

  label {
    cursor: pointer;
  }

  input[type="radio"] {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  &:has(input:checked) {
    color: white;
    background-color: black;
  }
`;

// -- -- --

const selectColors = ["", "navy", "midnight", "purple", "red", "dark-green", "teal"];

// -- -- --

const showLineNumbers = true;
const wrapLongLines = false;

const colorMixJs = `const root = document.documentElement;
const circle = document.getElementById("color-circle");
const percentRadios = document.querySelectorAll('input[name="percent"]');
const select = document.getElementById("select-brand");

percentRadios.forEach((input) => {
  input.addEventListener("click", (e) => {
    circle.style.backgroundColor = \`var(--color-\${e.target.value})\`;
  });
});

select.addEventListener("change", (e) => {
  if (select.value !== "-1") {
    root.style.setProperty("--color", \`var(--\${select.value})\`);
  }
});
`;

// -- -- --

function IndexPage() {
  const [percentMix, setPercentMix] = useState(`color-mix(in srgb, var(--color), transparent 100%)`);

  const percent = [...Array(11)].map((_, ii) => ii * 10);

  const handleColorChange = (e) => {
    if (e.target.value !== "") {
      document.documentElement.style.setProperty("--color", `var(--${e.target.value})`);
    }
  };

  return (
    <Layout pageTitle={title}>
      <h1 className="pageTitle">
        <span className="pageFlair">Color-Mix()</span>
      </h1>
      <div className="wrapFlex">
        <div className="wrapContents">
          <p>
            The <code>color-mix()</code> CSS function takes two <code>&lt;color&gt;</code> specifications and returns
            the result of mixing them, in a given <code>&lt;color-space&gt;</code>, by a specified amount.
          </p>
          <p>
            Here we are mixing a pure color with "transparent" to get a purely opaque version of the color. Basically
            the old
            <code>
              <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgb">rgba()</a>
            </code>{" "}
            with extra steps. Why? <tt aria-label="don't know...">¯\_(ツ)_/¯</tt>, but, it was a fun oppertunity to
            learn about <code>color-mix()</code>.
          </p>
          <p>
            <a href="https://www.w3.org/TR/css-color-5/#color-mix">spec</a> &amp;&amp;{" "}
            <a href="https://caniuse.com/?search=color-mix">can i use?</a>
          </p>
          <hr />
          <GlobalStyle />

          <WrapColorSample>
            <ColorSample percentMix={percentMix}></ColorSample>
          </WrapColorSample>

          <MaxWidthDiv>
            <SrOnlyLabel htmlFor="color-select">select a color</SrOnlyLabel>
            <SelectColor id="color-select" onChange={handleColorChange}>
              {selectColors.map((color, index) => (
                <option key={index} value={color}>
                  {color}
                </option>
              ))}
            </SelectColor>
          </MaxWidthDiv>

          <MaxWidthDiv>
            <Ul>
              {percent.map((num) => (
                <Li key={num}>
                  <label htmlFor={`percent-${num}`}>
                    <input
                      type="radio"
                      name="mix"
                      id={`percent-${num}`}
                      value={num}
                      onChange={(e) => {
                        setPercentMix(`color-mix(in srgb, var(--color), transparent ${100 - e.target.value}%)`);
                      }}
                    />
                    {num}
                  </label>
                </Li>
              ))}
            </Ul>
          </MaxWidthDiv>

          <hr />
          <h2>What Did We Learn Here?</h2>
          <p>
            This was a quick sample I had initially put together as stand-alone CSS/JS. The <code>color</code> and{" "}
            <code>color-mix()</code>
            percentages were set as CSS variables and some simple JS would change the value of the CSS{" "}
            <code>--color</code> variable to a different CSS variable or change the value of the{" "}
            <code>color-mix()</code> variable. Rewriting this in React took a bit longer than I had hoped for&hellip;
          </p>
          <p>To start off with my simple JS was:</p>
          <CodeBlock
            language="javascript"
            text={colorMixJs}
            theme={googlecode}
            showLineNumbers={showLineNumbers}
            wrapLongLines={wrapLongLines}
            customStyle={{
              fontSize: `0.833rem`,
              fontFamily: `Fira Code`,
            }}
            codeContainerStyle={{
              marginBottom: "1rem",
            }}
          />
          <p>
            And it took me a minute to get the replacement for <code>document.documentElement</code> to behave. The key
            was to do some RTFM for style-components and grok passing in <code>prop</code> the correct way.
          </p>
          <p>
            I also got to play around with{" "}
            <a href="https://github.com/rajinwonderland/react-code-blocks">react-code-blocks</a>, and that was fun!
          </p>
        </div>
        <aside className="wrapAside"></aside>
      </div>
    </Layout>
  );
}

export const Head = () => <Seo title={title} />;

export default IndexPage;
