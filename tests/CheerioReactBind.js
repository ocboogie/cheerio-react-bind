/* eslint react/prop-types: "off" */
import React from "react";
import Cheerio from "cheerio";
import * as Enzyme from "enzyme";

import CheerioReactBind, { update } from "../src/index";

const tags = {
  div: ({ children }) => <div>{children}</div>,
  h1: ({ children }) => <h1>{children}</h1>,
  p: ({ children }) => <p>{children}</p>
};

const $ = Cheerio.load(
  `
  <div foo=bar>
    <p>Paragraph</p>
  </div>
`,
  { xmlMode: true }
);

test("modifying the Cheerio dom updates the React dom with custom tags", () => {
  const wrapper = Enzyme.mount(
    <CheerioReactBind tags={tags} $elem={$("div").first()} $={$} />
  );
  expect(wrapper.html()).toMatchSnapshot();

  $("div").append(`<div>test</div>`);
  update($("div"));
  expect(wrapper.html()).toMatchSnapshot();

  $("p").text("Paragraph test");
  update($("p"));
  expect(wrapper.html()).toMatchSnapshot();
});

describe("error handling", () => {
  test("throwns when there is a unknown tag", () => {
    Enzyme.mount(
      <CheerioReactBind tags={tags} $elem={$("div").first()} $={$} />
    );
    $("div").append("<notag />");
    expect(() => {
      update($("div"));
    }).toThrow(new TypeError('Unknown tag "notag".'));
  });

  test("errorHandling runs when an error is thrown", () => {
    const mockErrorHandling = jest.fn();
    Enzyme.render(
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
});
