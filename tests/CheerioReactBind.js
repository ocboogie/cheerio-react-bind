/* eslint react/prop-types: "off" */
import React from "react";
import Cheerio from "cheerio";
import renderer from "react-test-renderer";

import CheerioReactBind, { update } from "../src/index";

const tags = {
  div: ({ children }) => <div>{children}</div>,
  h1: ({ children }) => <h1>{children}</h1>,
  p: ({ children }) => <p>{children}</p>
};

const $ = Cheerio.load(
  `
  <div>
    <p>Paragraph</p>
  </div>
`,
  { xmlMode: true }
);

test("modifying the Cheerio dom updates the React dom with custom tags", () => {
  const component = renderer.create(
    <CheerioReactBind tags={tags} $elem={$("div").first()} $={$} />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  $("div").append(`<div>test</div>`);
  update($("div"));
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  $("p").text("Paragraph test");
  update($("p"));
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test("throwns when there is a unknown tag", () => {
  renderer.create(
    <CheerioReactBind tags={tags} $elem={$("div").first()} $={$} />
  );
  $("div").append("<notag />");
  expect(() => {
    update($("div"));
  }).toThrow(new TypeError('Unknown tag "notag".'));
});

test("errorHandling runs when an error is thrown", () => {
  const mockErrorHandling = jest.fn();
  renderer.create(
    <CheerioReactBind
      errorHandler={mockErrorHandling}
      tags={tags}
      $elem={$("div").first()}
      $={$}
    />
  );
  $("div").append("<notag />");
  update($("div"));

  expect(mockErrorHandling.mock.calls[0][0]).toBe('Unknown tag "notag".');
});
