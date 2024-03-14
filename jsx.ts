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

type Child = string | number | JSXNode | Child[];

type Props = {
  // deno-lint-ignore no-explicit-any
  [key: string]: any;
  class?: string;
  style?: string;
  dangerouslySetInnerHTML?: { __html: string };
  onclick?: string;
};

declare global {
  namespace JSX {
    type Element =
      | JSXFunctionNode
      | JSXNode
      | JSXFragmentNode;
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


const escapeRegexp = /[&<>"]/;

// The `escapeToBuffer` implementation is based on code from the MIT licensed `react-dom` package.
// https://github.com/facebook/react/blob/main/packages/react-dom/src/server/escapeTextForBrowser.js
const escapeToBuffer = (str: string, buffer: string[]): void => {
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
  buffer: string[],
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

export type FC<T = Props> = (props: T) => JSX.Element | null;

export class JSXNode   {
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
    const buffer: string[] = [""];
    this.toStringToBuffer(buffer);
    return buffer[0];
  }

  toStringToBuffer(buffer: string[]): void {
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

        // deno-lint-ignore no-explicit-any
        const escapedString = new String(v.__html)  as any;
        escapedString.isEscaped = true;
        children = [escapedString];
      } else {
        buffer[0] += ` ${propsKeys[i]}="`;
        escapeToBuffer(v.toString(), buffer);
        buffer[0] += '"';
      }
    }

    buffer[0] += ">";

    if (emptyTags.includes(tag as string)) {
      return;
    }

    childrenToStringToBuffer(children, buffer);

    buffer[0] += `</${tag}>`;
  }
}

class JSXFunctionNode extends JSXNode {
  toStringToBuffer(buffer: string[]): void {
    const { children } = this;

    // deno-lint-ignore ban-types
    const res = (this.tag as Function).call(null, {
      ...this.props,
      children: children.length <= 1 ? children[0] : children,
    });

    if (res instanceof JSXNode) {
      res.toStringToBuffer(buffer);
    } else if (typeof res === "number" || res.isEscaped) {
      buffer[0] += res;
    } else {
      escapeToBuffer(res, buffer);
    }
  }
}

class JSXFragmentNode extends JSXNode {
  toStringToBuffer(buffer: string[]): void {
    childrenToStringToBuffer(this.children, buffer);
  }
}

export const h = (
  tag: string | CallableFunction,
  props: Props,
  ...children: Child[]
): JSX.Element => {
  if (typeof tag === "function") {
    return new JSXFunctionNode(tag, props, children);
  } else {
    return new JSXNode(tag, props, children);
  }
};

export const Fragment = (
  props: { key?: string; children?: Child[] },
): JSX.Element => new JSXFragmentNode("", {}, props.children || []);
