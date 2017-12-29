# cheerio-react-bind

This React component binds a Cheerio dom to its own dom with custom tags

This is a core component for the [action-hub](https://github.com/ocboogie/action-hub) project.

## Example/usage:

```js
import ReactDOM from "react-dom";
import React from "react";
import Cheerio from "cheerio";
import CheerioReactBind from "cheerio-react-bind";

// Custom tags
const tags = {
  bigtext: ({ children }) => <h1>{children}</h1>,
  smalltext: ({ children }) => <p>{children}</p>,
  div: ({ children }) => <div>{children}</div>
};

// Load the Cheerio dom
const $ = Cheerio.load(
  `
  <div id="root"></div>
  `,
  { xmlMode: true }
);

// Render with the Cheerio dom
ReactDOM.render(
  <CheerioReactBind $={$} $elem={$("#root").first()} tags={tags} />,
  document.getElementById("container")
);

$("div").append("<bigtext>Very big</bigtext>");
// Nothing changes until we update
$("div").update();
setTimeout(() => {
  $("div").append("<smalltext>Small text one second later</smalltext>");
  $("div").update();
}, 1000);
```

Better examples in the examples folder

## Contributing

1. Install:

```
git clone https://github.com/ocboogie/cheerio-react-bind.git cheerio-react-bind
cd cheerio-react-bind
npm install
```

2. Create a feature branch
3. Make some changes
4. Follow linting rules
5. Successfully run tests
6. Create a pull request
