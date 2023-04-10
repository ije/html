/** @jsx h */

import { h, JSXNode } from "./jsx.ts";

const plugins: Plugin[] = [];

export interface HtmlOptions {
  lang?: string;
  classes?: {
    html?: string[];
    body?: string[];
  };
  title?: string;
  meta?: Record<string, string | null | undefined>;
  links?: (boolean | { [key: string]: string; href: string; rel: string })[];
  styles?: (boolean | string | { href?: string; text?: string; id?: string })[];
  scripts?: (boolean | string | {
    src?: string;
    text?: string;
    type?: string;
    id?: string;
    async?: boolean;
    defer?: boolean;
  })[];
}

export interface PluginContext extends HtmlOptions {
  body: string;
  status: number;
  headers: Headers;
}

export interface Plugin {
  (props: PluginContext): void | Promise<void>;
}

export interface Options extends HtmlOptions {
  body: JSXNode | string;
  status?: number;
  headers?: HeadersInit;
}

export default async function html(
  options: Options | JSXNode | string,
): Promise<Response> {
  const { body, status = 200, headers: headersInit, ...rest } =
    options instanceof JSXNode || typeof options === "string"
      ? { body: options } as Options
      : options;
  const bodyHtml = typeof body === "string" ? body : body.toString();
  const headers = new Headers(headersInit);
  headers.append("Content-Type", "text/html; charset=utf-8");
  const context: PluginContext = {
    ...rest,
    body: bodyHtml,
    status,
    headers,
  };
  for (const plugin of plugins) {
    await plugin(context);
  }
  const root = <Html {...context} />;
  return new Response(
    `<!DOCTYPE html>` + root.toString(),
    {
      status: context.status,
      headers: context.headers,
    },
  );
}

interface HtmlProps extends HtmlOptions {
  body: string;
}

function Html({
  lang,
  classes,
  title,
  meta,
  links,
  styles,
  scripts,
  body,
}: HtmlProps) {
  return (
    <html
      lang={lang ?? "en"}
      class={classes?.html?.join(" ") || undefined}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {title && <title>{title}</title>}
        {meta &&
          Object.entries(meta).filter(([name, content]) => !!name && !!content)
            .map(([name, content]) => (
              name.startsWith("og:")
                ? <meta property={name} content={String(content)} />
                : <meta name={name} content={String(content)} />
            ))}
        {links &&
          links.filter(boolFilter).map(({ rel, href, ...rest }) => (
            <link rel={rel} href={href} {...rest} />
          ))}
        {styles && styles.filter(boolFilter).map((style) => (
          typeof style === "string"
            ? <style dangerouslySetInnerHTML={{ __html: style }} />
            : (
              <link
                id={style.id}
                rel="stylesheet"
                href={style.href}
                dangerouslySetInnerHTML={style.text
                  ? { __html: style.text }
                  : undefined}
              />
            )
        ))}
        {scripts && scripts.filter(boolFilter).map((script) => (
          typeof script === "string"
            ? <script dangerouslySetInnerHTML={{ __html: script }} />
            : (
              <script
                id={script.id}
                type={script.type}
                src={script.src}
                async={script.async}
                defer={script.defer}
                dangerouslySetInnerHTML={script.text
                  ? { __html: script.text }
                  : undefined}
              />
            )
        ))}
      </head>
      <body
        class={classes?.body?.join(" ") || undefined}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </html>
  );
}

function boolFilter<T>(value: T | boolean): value is T {
  return Boolean(value);
}

html.use = (...plugin: Plugin[]) => {
  plugins.push(...plugin);
};

export { type FC, Fragment, h, JSXNode, memo } from "./jsx.ts";
