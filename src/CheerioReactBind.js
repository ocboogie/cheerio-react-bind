import React from "react";
import PropTypes from "prop-types";

export default class CheerioReactBind extends React.Component {
  constructor(props) {
    super(props);
    this.props.$elem.data("update", this.update.bind(this));
    this.update(true);
  }

  update(first = false) {
    const children = [];
    const $children = this.props.$elem.children();
    if ($children.length > 0) {
      this.props.$elem.children().each((index, elem) => {
        const $child = this.props.$(elem);
        children.push(
          <CheerioReactBind
            errorHandler={this.props.errorHandler}
            key={index}
            $={this.props.$}
            $elem={$child}
            tags={this.props.tags}
            tagRenderer={this.props.tagRenderer}
            location={`${
              this.props.location === "/" ? "" : this.props.location
            }/${$child.index()}:${$child.prop("tagName").toLowerCase()}`}
          />
        );
      });
    } else {
      children.push(this.props.$elem.text());
    }
    const state = {
      attributes: this.props.$elem.attr(),
      children
    };
    if (first) {
      this.state = state;
    } else {
      this.setState(state);
    }
  }

  render() {
    const { $elem } = this.props;
    const tagName = $elem.prop("tagName").toLowerCase();
    if (!this.props.tagRenderer && !this.props.tags) {
      throw new TypeError(
        'You must pass a "tagRenderer" prop or a "tags" prop.'
      );
    }

    if (this.props.tagRenderer) {
      const TagHander = this.props.tagRenderer;
      return (
        <TagHander
          location={this.props.location}
          tagName={tagName}
          attributes={this.state.attributes}
        >
          {this.state.children}
        </TagHander>
      );
    }

    if (!Object.prototype.hasOwnProperty.call(this.props.tags, tagName)) {
      const errMsg = `Unknown tag "${tagName}".`;
      if (this.props.errorHandler) {
        this.props.errorHandler(errMsg);
        return <div />;
      }
      throw new TypeError(errMsg);
    }
    const Component = this.props.tags[tagName];
    return (
      <Component {...this.state.attributes}>{this.state.children}</Component>
    );
  }
}

/* eslint-disable react/require-default-props, consistent-return */
CheerioReactBind.propTypes = {
  $: (props, propName) => {
    const $ = props[propName];
    if (!$) {
      return new Error('Prop type "$" is required for CheerioReactBind');
    }
    if (!$.root) {
      return new Error(
        'Prop type "$" must be a valid Cheerio object for CheerioReactBind'
      );
    }
  },
  $elem: (props, propName) => {
    const $elem = props[propName];
    if (!$elem) {
      return new Error('Prop type "$elem" is required for CheerioReactBind');
    }
    if (!$elem.data || !$elem.prop) {
      return new Error(
        'Prop type "$" must be a valid Cheerio element for CheerioReactBind'
      );
    }
  },
  // eslint-disable-next-line react/forbid-prop-types
  tags: PropTypes.object,
  tagRenderer: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  errorHandler: PropTypes.func,
  location: PropTypes.string
};
/* eslint-enable react/require-default-props, consistent-return */

CheerioReactBind.defaultProps = {
  location: "/"
};
