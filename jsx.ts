/**
MIT License

Copyright (c) 2021 - present, Yusuke Wada and Hono contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// deno-lint-ignore no-explicit-any
type Props = Record<string, any>;
type Child = string | number | JSXNode | Child[];

declare global {
  namespace JSX {
    type Element = HtmlEscapedString;
    interface IntrinsicElements {
      [tagName: string]: Props;
    }
  }
}

const emptyTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

const booleanAttributes = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected",
];

type HtmlEscaped = { isEscaped: true };
type HtmlEscapedString = string & HtmlEscaped;
type StringBuffer = [string];

const escapeRegexp = /[&<>"]/;

// The `escapeToBuffer` implementation is based on code from the MIT licensed `react-dom` package.
// https://github.com/facebook/react/blob/main/packages/react-dom/src/server/escapeTextForBrowser.js
const escapeToBuffer = (str: string, buffer: StringBuffer): void => {
  const match = str.search(escapeRegexp);
  if (match === -1) {
    buffer[0] += str;
    return;
  }

  let escape;
  let index;
  let lastIndex = 0;

  for (index = match; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = "&quot;";
        break;
      case 38: // &
        escape = "&amp;";
        break;
      case 60: // <
        escape = "&lt;";
        break;
      case 62: // >
        escape = "&gt;";
        break;
      default:
        continue;
    }

    buffer[0] += str.substring(lastIndex, index) + escape;
    lastIndex = index + 1;
  }

  buffer[0] += str.substring(lastIndex, index);
};

const childrenToStringToBuffer = (
  children: Child[],
  buffer: StringBuffer,
): void => {
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i];
    if (typeof child === "string") {
      escapeToBuffer(child, buffer);
    } else if (
      typeof child === "boolean" || child === null || child === undefined
    ) {
      continue;
    } else if (child instanceof JSXNode) {
      child.toStringToBuffer(buffer);
    } else if (
      typeof child === "number" ||
      (child as unknown as { isEscaped: boolean }).isEscaped
    ) {
      buffer[0] += child;
    } else {
      // `child` type is `Child[]`, so stringify recursively
      childrenToStringToBuffer(child, buffer);
    }
  }
};

export class JSXNode implements HtmlEscaped {
  tag: string | CallableFunction;
  props: Props;
  children: Child[];
  isEscaped: true = true;
  constructor(tag: string | CallableFunction, props: Props, children: Child[]) {
    this.tag = tag;
    this.props = props;
    this.children = children;
  }

  toString(): string {
    const buffer: StringBuffer = [""];
    this.toStringToBuffer(buffer);
    return buffer[0];
  }

  toStringToBuffer(buffer: StringBuffer): void {
    const tag = this.tag as string;
    const props = this.props;
    let { children } = this;

    buffer[0] += `<${tag}`;

    const propsKeys = Object.keys(props || {});

    for (let i = 0, len = propsKeys.length; i < len; i++) {
      const v = props[propsKeys[i]];
      if (typeof v === "string") {
        buffer[0] += ` ${propsKeys[i]}="`;
        escapeToBuffer(v, buffer);
        buffer[0] += '"';
      } else if (typeof v === "number") {
        buffer[0] += ` ${propsKeys[i]}="${v}"`;
      } else if (v === null || v === undefined) {
        // Do nothing
      } else if (
        typeof v === "boolean" && booleanAttributes.includes(propsKeys[i])
      ) {
        if (v) {
          buffer[0] += ` ${propsKeys[i]}=""`;
        }
      } else if (propsKeys[i] === "dangerouslySetInnerHTML") {
        if (children.length > 0) {
          throw "Can only set one of `children` or `props.dangerouslySetInnerHTML`.";
        }

        const escapedString = new String(v.__html) as HtmlEscapedString;
        escapedString.isEscaped = true;
        children = [escapedString];
      } else {
        buffer[0] += ` ${propsKeys[i]}="`;
        escapeToBuffer(v.toString(), buffer);
        buffer[0] += '"';
      }
    }

    if (emptyTags.includes(tag as string)) {
      buffer[0] += "/>";
      return;
    }

    buffer[0] += ">";

    childrenToStringToBuffer(children, buffer);

    buffer[0] += `</${tag}>`;
  }
}

class JSXFunctionNode extends JSXNode {
  toStringToBuffer(buffer: StringBuffer): void {
    const { children } = this;

    // deno-lint-ignore ban-types
    const res = (this.tag as Function).call(null, {
      ...this.props,
      children: children.length <= 1 ? children[0] : children,
    });

    if (res instanceof JSXNode) {
      res.toStringToBuffer(buffer);
    } else if (typeof res === "number" || (res as HtmlEscaped).isEscaped) {
      buffer[0] += res;
    } else {
      escapeToBuffer(res, buffer);
    }
  }
}

class JSXFragmentNode extends JSXNode {
  toStringToBuffer(buffer: StringBuffer): void {
    childrenToStringToBuffer(this.children, buffer);
  }
}

export const h = (
  tag: string | CallableFunction,
  props: Props,
  ...children: (string | HtmlEscapedString)[]
): JSXNode => {
  if (typeof tag === "function") {
    return new JSXFunctionNode(tag, props, children);
  } else {
    return new JSXNode(tag, props, children);
  }
};

export type FC<T = Props> = (props: T) => HtmlEscapedString;

const shallowEqual = (a: Props, b: Props): boolean => {
  if (a === b) {
    return true;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (let i = 0, len = aKeys.length; i < len; i++) {
    if (a[aKeys[i]] !== b[aKeys[i]]) {
      return false;
    }
  }

  return true;
};

export const memo = <T>(
  component: FC<T>,
  propsAreEqual: (prevProps: Readonly<T>, nextProps: Readonly<T>) => boolean =
    shallowEqual,
): FC<T> => {
  let computed = undefined;
  let prevProps: T | undefined = undefined;
  return ((props: T): HtmlEscapedString => {
    if (prevProps && !propsAreEqual(prevProps, props)) {
      computed = undefined;
    }
    prevProps = props;
    return (computed ||= component(props));
  }) as FC<T>;
};

export const Fragment = (
  props: { key?: string; children?: Child[] },
): JSXNode => {
  return new JSXFragmentNode("", {}, props.children || []);
};
