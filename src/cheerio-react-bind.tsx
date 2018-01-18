import * as React from "react";

declare global {
  interface Cheerio {
    update: () => void;
  }
}

export interface TagRendererProps {
  location: string;
  tagName: string;
  attributes: { [key: string]: any };
}

export interface CheerioReactBindProps {
  $elem: Cheerio;
  $: CheerioStatic;
  tags?: {
    [tagName: string]: React.ComponentClass<any> | React.StatelessComponent<any>;
  };
  tagRenderer?: React.ComponentClass<TagRendererProps> | React.StatelessComponent<TagRendererProps>;
  errorHandler?: (errorMsg: string) => void;
  location?: string;
}

export interface CheerioReactBindState {
  children: React.ReactNode[];
  attributes: {
    [attr: string]: any;
  };
}

export default class CheerioReactBind extends React.Component<
  CheerioReactBindProps,
  CheerioReactBindState
> {
  public location: string;
  public tagName: string;
  public errorThrown = false;

  constructor(props: CheerioReactBindProps) {
    super(props);

    if (!this.props.tagRenderer && !this.props.tags) {
      throw new TypeError('You must pass a "tagRenderer" prop or a "tags" prop.');
    }

    if (this.props.location) {
      this.location = this.props.location;
    } else {
      this.location = "/";
      // Register update function
      (this.props.$ as any).fn.update = this.update.bind(this);
    }
    const { $elem } = this.props;
    this.tagName = $elem.prop("tagName").toLowerCase();

    if (!this.props.tagRenderer) {
      if (
        !Object.prototype.hasOwnProperty.call(this.props.tags, this.tagName)
      ) {
        const errMsg = `Unknown tag name "${this.tagName}".`;
        if (this.props.errorHandler) {
          this.props.errorHandler(errMsg);
          this.errorThrown = true;
        } else {
          throw new TypeError(errMsg);
        }
      }
    }

    this.update(true);
  }

  public update(initial = false) {
    const $contents = this.props.$elem.contents();
    const children: React.ReactNode[] = $contents
      .map((index, elem) => {
        if (
          elem.type === "text" &&
          elem.data &&
          elem.data.trim().length !== 0
        ) {
          return elem.data;
        } else if (elem.type === "tag") {
          const $child = this.props.$(elem);
          return (
            <CheerioReactBind
              errorHandler={this.props.errorHandler}
              key={index}
              $={this.props.$}
              $elem={$child}
              tags={this.props.tags}
              tagRenderer={this.props.tagRenderer}
              location={`${this.location}${$child.index()}:${$child
                .prop("tagName")
                .toLowerCase()}/`}
            />
          );
        }
      })
      .get();
    const state: CheerioReactBindState = {
      attributes: this.props.$elem.attr(),
      children
    };
    if (initial) {
      this.state = state;
    } else {
      this.setState(state);
    }
  }

  public render() {
    if (this.errorThrown) {
      return <div />;
    }

    if (this.props.tagRenderer) {
      const TagHander = this.props.tagRenderer;
      return (
        <TagHander
          location={this.location}
          tagName={this.tagName}
          attributes={this.state.attributes}
        >
          {this.state.children}
        </TagHander>
      );
    } else if (this.props.tags) {
      const Tag = this.props.tags[this.tagName];
      return <Tag {...this.state.attributes}>{this.state.children}</Tag>;
    }
  }
}
