/** @jsx h */

import { h, type VNode } from "https://esm.sh/preact@10.8.2";
import {
  renderToString,
} from "https://esm.sh/preact-render-to-string@5.2.0?deps=preact@10.8.2";

const plugins: Plugin[] = [];

export interface HtmlOptions {
  lang?: string;
  colorScheme?: "dark" | "light" | "auto";
  title?: string;
  meta?: Record<string, string | null | undefined>;
  links?: { [key: string]: string; href: string; rel: string }[];
  styles?: (string | { href: string; id?: string })[];
  scripts?: (string | {
    src: string;
    type?: string;
    id?: string;
    async?: boolean;
    defer?: boolean;
  })[];
}

export interface PluginContext extends HtmlOptions {
  body: string;
  status: number;
  headers: HeadersInit;
}

export interface Plugin {
  (props: PluginContext): void | Promise<void>;
}

export interface Options extends HtmlOptions {
  body: VNode;
  status?: number;
  headers?: HeadersInit;
}

export async function html(options: Options): Promise<Response> {
  const { body, status = 200, headers: headersInit, ...rest } = options;
  const bodyHtml = renderToString(body);
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
  return new Response(
    `<!DOCTYPE html>` +
      renderToString(
        <Html {...context} />,
      ),
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
  colorScheme,
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
      class={colorScheme === "dark" ? "dark" : undefined}
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
          links.map(({ rel, href, ...rest }) => (
            <link rel={rel} href={href} {...rest} />
          ))}
        {styles && styles.map((style) => (
          typeof style === "string"
            ? <style dangerouslySetInnerHTML={{ __html: style }} />
            : <link rel="stylesheet" href={style.href} id={style.id} />
        ))}
        {scripts && scripts.map((script) => (
          typeof script === "string"
            ? <script dangerouslySetInnerHTML={{ __html: script }} />
            : (
              <script
                src={script.src}
                type={script.type}
                id={script.id}
                async={script.async}
                defer={script.defer}
              >
              </script>
            )
        ))}
        {(colorScheme === "auto" || colorScheme === "dark") && (
          <style
            dangerouslySetInnerHTML={{
              __html:
                `.dark{color-scheme:dark}.dark ::-moz-selection{background:#444}.dark ::selection{background:#444}`,
            }}
          />
        )}
        {colorScheme === "auto" && (
          <script
            dangerouslySetInnerHTML={{
              __html:
                `(()=>{let v=localStorage.getItem("color-scheme"),a=window.matchMedia("(prefers-color-scheme: dark)").matches,cl=document.documentElement.classList,setColorScheme=v=>(!v||v==="auto"?a:v==="dark")?cl.add("dark"):cl.remove("dark");setColorScheme(v);window.setColorScheme=v=>{setColorScheme(v);localStorage.setItem("color-scheme",v)};})();`,
            }}
          />
        )}
      </head>
      <body dangerouslySetInnerHTML={{ __html: body }} />
    </html>
  );
}

html.use = (...plugin: Plugin[]) => {
  plugins.push(...plugin);
};

export * from "https://esm.sh/preact@10.7.2";
