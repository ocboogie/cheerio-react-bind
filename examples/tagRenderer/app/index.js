import ReactDOM from "react-dom";
import React from "react";
import Cheerio from "cheerio";
import CheerioReactBind from "cheerio-react-bind";

// Custom tags of type { [key: string]: react.component; } in typescript
const tags = {
  grid: ({ children }) => {
    const gridSize = `${(
      100 / Math.ceil(Math.sqrt(children.length))
    ).toString()}%`;
    const childStyle = {
      width: gridSize,
      height: gridSize,
      float: "left",
      outline: "1px solid black"
    };
    const components = children.map((child, key) => (
      <div style={childStyle} key={key}>
        {child}
      </div>
    ));
    return <div>{components}</div>;
  },
  text: ({ children }) => <h1>{children}</h1>
};

const tagRenderer = ({ tagName, attributes, children }) => {
  const Component = tags[tagName];
  return <Component {...attributes}>{children}</Component>;
};

// Load the Cheerio dom
const $ = Cheerio.load(
  `
  <grid id="root"></grid>
  `,
  { xmlMode: true }
);

ReactDOM.render(
  <CheerioReactBind
    $={$}
    $elem={$("#root").first()}
    tagRenderer={tagRenderer}
  />,
  document.getElementById("container")
);

let i = 0;
const grid = $("grid");
setInterval(() => {
  // Append the text tag to the grid tag
  grid.append(`<text>${i}</text>`);
  // Update the grid
  grid.update();
  i += 1;
}, 1000);
