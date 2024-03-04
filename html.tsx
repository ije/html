/** @jsx h */
import { h, JSXNode } from "./jsx.ts";

export interface HtmlOptions {
  lang?: string;
  classes?: { html?: (string | boolean)[]; body?: (string | boolean)[] };
  title?: string;
  meta?: Record<string, boolean | string | null | undefined>;
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
  plugins?: Plugin[];
}

export interface PluginContext
  extends
    Omit<Required<HtmlOptions>, "plugins" | "classes" | "lang" | "title"> {
  lang?: string;
  title?: string;
  classes: { html: (string | boolean)[]; body: (string | boolean)[] };
  body: string;
  status: number;
  headers: Headers;
}

export interface Plugin {
  (props: PluginContext): void | Promise<void>;
}

export interface RenderOptions extends HtmlOptions {
  body: JSXNode | string;
  status?: number;
  headers?: HeadersInit;
}

export default async function html(
  input: JSXNode | string | RenderOptions,
): Promise<Response> {
  const {
    classes = {},
    meta = {},
    links = [],
    styles = [],
    scripts = [],
    body,
    status = 200,
    headers: headersInit,
    plugins,
    ...rest
  } = input instanceof JSXNode || typeof input === "string"
    ? { body: input } as RenderOptions
    : input;
  const { html: htmlClasses = [], body: bodyClasses = [] } = classes;
  const bodyHtml = typeof body === "string" ? body : body.toString();
  const headers = new Headers(headersInit);
  headers.append("Content-Type", "text/html; charset=utf-8");
  const context: PluginContext = {
    ...rest,
    classes: {
      html: htmlClasses,
      body: bodyClasses,
    },
    meta,
    links,
    styles,
    scripts,
    body: bodyHtml,
    status,
    headers,
  };
  for (const plugin of html.plugins) {
    await plugin(context);
  }
  if (plugins) {
    for (const plugin of plugins) {
      if (!html.plugins.includes(plugin))  {
        await plugin(context);
      }
    }
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

export type HtmlProps = Omit<PluginContext, "status" | "headers">;

export function Html(props: HtmlProps) {
  const {
    lang,
    title,
    classes,
    meta,
    links,
    styles,
    scripts,
    body,
  } = props;
  return (
    <html
      lang={lang ?? "en"}
      class={classes.html.filter(Boolean).join(" ") || undefined}
    >
      <head>
        <meta charSet="utf-8" />
        {title && <title>{title}</title>}
        {Object.entries(meta).filter(([name, content]) => !!name && !!content)
          .map(([name, content]) => (
            name.startsWith("og:")
              ? <meta property={name} content={String(content)} />
              : <meta name={name} content={String(content)} />
          ))}
        {links.filter(boolFilter).map(({ rel, href, ...rest }) => (
          <link rel={rel} href={href} {...rest} />
        ))}
        {styles.filter(boolFilter).map((style) => (
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
        {scripts.filter(boolFilter).map((script) => (
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
        class={classes.body.filter(Boolean).join(" ") || undefined}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </html>
  );
}

function boolFilter<T>(value: T | boolean): value is T {
  return Boolean(value);
}

html.plugins = [] as Plugin[];
html.use = (...plugin: Plugin[]) => {
  html.plugins.push(...plugin);
};
