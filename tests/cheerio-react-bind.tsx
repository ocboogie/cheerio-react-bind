import * as Cheerio from "cheerio";
import * as Enzyme from "enzyme";
import * as React from "react";

import CheerioReactBind, { TagRendererProps } from "../src/cheerio-react-bind";

const tags = {
  div: ({ children }) => <div>{children}</div>,
  h1: ({ children }) => <h1>{children}</h1>,
  p: ({ children }) => <p>{children}</p>,
  throw: ({ error }) => {
    if (error) {
      throw error;
    }
    return <div />;
  }
};

const $ = Cheerio.load(
  `
  <div foo=bar>
    <p>Paragraph</p>
  </div>
`,
  { xmlMode: true }
);

test("update the Cheerio dom when the React dom is updated", () => {
  const wrapper = Enzyme.mount(
    <CheerioReactBind tags={tags} $elem={$("div").first()} $={$} />
  );
  expect(wrapper.html()).toMatchSnapshot();

  $("div").append(`<div>test</div>`);
  $("div").update();
  expect(wrapper.html()).toMatchSnapshot();

  $("p").text("Paragraph test");
  $("p").update();
  expect(wrapper.html()).toMatchSnapshot();
});

test("able to have text nodes and tag nodes as children", () => {
  const $mock = Cheerio.load(
    `
    <div>
      foo
      <p>bar</p>
      baz
    </div>
  `,
    { xmlMode: true }
  );

  const wrapper = Enzyme.mount(
    <CheerioReactBind tags={tags} $elem={$mock("div").first()} $={$mock} />
  );
  expect(wrapper.html()).toMatchSnapshot();
});

describe("error handling", () => {
  (Error.prototype as any).suppressReactErrorLogging = true;
  test("throws when there is a unknown tag", () => {
    // This test will cause a lot of spam
    // Related issue https://github.com/airbnb/enzyme/issues/1255
    Enzyme.mount(
      <CheerioReactBind tags={tags} $elem={$("div").first()} $={$} />
    );
    $("div").append("<notag />");
    expect(() => {
      $("div").update();
    }).toThrowErrorMatchingSnapshot();
  });

  test("errorHandling runs when an error is thrown", () => {
    const mockErrorHandling = jest.fn();
    Enzyme.mount(
      <CheerioReactBind
        errorHandler={mockErrorHandling}
        tags={tags}
        $elem={$("div").first()}
        $={$}
      />
    );
    $("div").append("<notag />");
    $("div").update();

    expect(mockErrorHandling.mock.calls[0][0]).toBe(
      'There was an error rendering a tag at "/": "TypeError: Unknown tag name "notag"."'
    );
  });

  test("catches all errors", () => {
    const mockErrorHandling = jest.fn();
    const $mock = Cheerio.load(
      `
      <div>
        <throw error="oops" />
      </div>
    `,
      { xmlMode: true }
    );

    Enzyme.mount(
      <CheerioReactBind
        errorHandler={mockErrorHandling}
        tags={tags}
        $elem={$mock("div").first()}
        $={$mock}
      />
    );

    expect(mockErrorHandling.mock.calls[0][0]).toBe(
      'There was an error rendering a tag at "/0:throw/": "oops"'
    );
  });

  test("throws when neither tags nor tagRenderer are passed", () => {
    expect(() => {
      Enzyme.render(<CheerioReactBind $elem={$("div").first()} $={$} />);
    }).toThrow('You must pass a "tagRenderer" prop or a "tags" prop.');
  });

  test("use errorComponent when an error is thrown", () => {
    const mockErrorHandling = jest.fn();
    const $mock = Cheerio.load(
      `
      <div>
        <throw error="oops" />
      </div>
    `,
      { xmlMode: true }
    );

    const errorComponent = () => <h1>Oh no!</h1>;

    const wrapper = Enzyme.mount(
      <CheerioReactBind
        errorHandler={mockErrorHandling}
        errorComponent={errorComponent}
        tags={tags}
        $elem={$mock("div").first()}
        $={$mock}
      />
    );

    expect(wrapper.contains(<h1>Oh no!</h1>)).toBeTruthy();
  });

  (Error.prototype as any).suppressReactErrorLogging = false;
});

describe("tagRenderer", () => {
  test("gets passed children, attributes and tagName", () => {
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
      attributes: { bar: "baz" },
      tagName: "foo"
    });
    expect(() =>
      Enzyme.shallow(tagRenderer.mock.calls[0][0].children[0])
    ).not.toThrow();
  });

  test("gets passed args from tagRendererArgs prop", () => {
    const tagRenderer = jest.fn(() => <div />);
    Enzyme.mount(
      <CheerioReactBind
        tagRenderer={tagRenderer}
        tagRendererArgs={{ foo: "bar" }}
        $elem={$("div").first()}
        $={$}
      />
    );
    expect(tagRenderer.mock.calls[0][0].foo).toBe("bar");
  });

  test("renders", () => {
    const $mock = Cheerio.load(
      `
    <foo bar="baz"><qux>quux</qux></foo>
  `,
      { xmlMode: true }
    );
    const tagRenderer: React.StatelessComponent<TagRendererProps> = ({
      tagName,
      children
    }) => {
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
  const tagRenderer: React.StatelessComponent<TagRendererProps> = ({
    tagName,
    location,
    children
  }) => {
    if (tagName === "baz") {
      expect(location).toBe("/1:bar/0:baz/");
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
