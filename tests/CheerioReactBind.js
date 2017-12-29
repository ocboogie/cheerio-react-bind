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

describe("tagRenderer", () => {
  test("passed children, attributes and tagName", () => {
    const $mock = Cheerio.load(
      `
    <foo bar="baz"><qux /></foo>
  `,
      { xmlMode: true }
    );
    const tagRenderer = jest.fn(() => <div />);
    Enzyme.mount(
      <CheerioReactBind
        tagRenderer={tagRenderer}
        $elem={$mock("foo").first()}
        $={$mock}
      />
    );
    expect(tagRenderer.mock.calls[0][0]).toMatchObject({
      tagName: "foo",
      attributes: { bar: "baz" }
    });
    expect(() =>
      Enzyme.shallow(tagRenderer.mock.calls[0][0].children[0])
    ).not.toThrow();
  });

  test("renders", () => {
    const $mock = Cheerio.load(
      `
    <foo bar="baz"><qux>quux</qux></foo>
  `,
      { xmlMode: true }
    );
    const tagRenderer = ({ tagName, children }) => {
      if (tagName === "foo") {
        return <span>{children}</span>;
      } else if (tagName === "qux") {
        return <h2>{children}</h2>;
      }
      return null;
    };
    const wrapper = Enzyme.mount(
      <CheerioReactBind
        tagRenderer={tagRenderer}
        $elem={$mock("foo").first()}
        $={$mock}
      />
    );
    expect(wrapper.html()).toMatchSnapshot();
  });
});

test("throwns when then neither tags nor tagRenderer", () => {
  expect(() => {
    Enzyme.render(<CheerioReactBind $elem={$("div").first()} $={$} />);
  }).toThrow(
    new TypeError('You must pass a "tagRenderer" prop or a "tags" prop.')
  );
});

test("tagRenderer gets passed the location of the tag", () => {
  const $mock = Cheerio.load(
    `
    <div>
      <foo></foo>
      <bar><baz></baz></bar>
    </div>
`,
    { xmlMode: true }
  );
  const tagRenderer = ({ tagName, location, children }) => {
    if (tagName === "baz") {
      expect(location).toBe("/1:bar/0:baz");
    }
    return <div>{children}</div>;
  };
  Enzyme.mount(
    <CheerioReactBind
      tagRenderer={tagRenderer}
      $elem={$mock("div").first()}
      $={$mock}
    />
  );
});
