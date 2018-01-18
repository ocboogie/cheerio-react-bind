import ReactDOM from "react-dom";
import React from "react";
import Cheerio from "cheerio";
import CheerioReactBind from "cheerio-react-bind";

// Custom tags of type { [key: string]: react.component; } in typescript
const tags = {
  container: ({ children }) => <div>{children}</div>,
  smalltext: ({ children }) => <p>{children}</p>,
  bigtext: ({ children }) => <h1>{children}</h1>
};

// Load the Cheerio dom
const $ = Cheerio.load(
  `
  <container id="root"></container>
  `,
  { xmlMode: true }
);

// Called a error occurs
function errorHandler(msg) {
  // eslint-disable-next-line no-alert
  alert(`There was a error: ${msg}`);
}

ReactDOM.render(
  <CheerioReactBind
    errorHandler={errorHandler}
    $={$}
    $elem={$("#root").first()}
    tags={tags}
  />,
  document.getElementById("container")
);

$("#root").append("<smalltext>Very small text</smalltext>");
$("#root").append("<bigtext>Very big text</bigtext>");
// Nothing changed on the view yet
setTimeout(() => {
  // Now the view changed
  $("#root").update();
}, 1000);

setTimeout(() => {
  $("#root").append("<div>An error will be thrown</div>");
  $("#root").update();
  // This will throw an error because div is not a tag
  // Note: normal HTML tags are not allowed
  // This is why div is an unknown tag
}, 2000);
