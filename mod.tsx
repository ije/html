/** @jsx h */

import { h, type VNode } from "https://esm.sh/preact@10.7.2";
import {
  renderToString,
} from "https://esm.sh/preact-render-to-string@5.2.0?deps=preact@10.7.2";
import {
  type Preset,
  UnoGenerator,
  type UserConfig,
} from "https://esm.sh/@unocss/core@0.37.2";
import presetWind from "https://esm.sh/@unocss/preset-wind@0.37.2?bundle&no-check";

const resetCSS =
  `/* reset */*,::after,::before{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentColor}html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";scrollbar-gutter:stable}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]{display:none}.dark{color-scheme:dark}.dark ::-moz-selection{background:#444}.dark ::selection{background:#444}div{display:flex;flex-direction:column}div[row=""]{display:flex;flex-direction:row}div[block=""]{display:block}`;

let uno = new UnoGenerator({ presets: [presetWind() as unknown as Preset] });

export function configureUnoCSS(config: UserConfig) {
  uno = new UnoGenerator(config);
}

export interface HtmlOptions {
  lang?: string;
  title?: string;
  meta?: Record<string, string | null | undefined>;
  styles?: (string | { href: string; id?: string })[];
  scripts?: (string | { src: string; type?: string; id?: string })[];
}

export interface Options extends HtmlOptions {
  body: VNode;
  status?: number;
  headers?: HeadersInit;
}

export async function html(options: Options): Promise<Response> {
  const { body, status, headers: headersInit, ...rest } = options;
  const headers = new Headers(headersInit);
  headers.append("Content-Type", "text/html; charset=utf-8");
  const bodyHtml = renderToString(body);
  const { css } = await uno.generate(bodyHtml, { minify: true });
  return new Response(
    renderToString(
      <Html
        body={bodyHtml}
        unocss={{ css, version: uno.version }}
        {...rest}
      />,
    ),
    { status, headers },
  );
}

interface HtmlProps extends HtmlOptions {
  body: string;
  unocss: { css: string; version: string };
}

function Html({ lang, title, meta, styles, scripts, body, unocss }: HtmlProps) {
  return (
    <html lang={lang ?? "en"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {title && <title>{title}</title>}
        {meta &&
          Object.entries(meta).filter(([name, content]) => !!name && !!content)
            .map(([name, content]) => (
              <meta name={name} content={String(content)} />
            ))}
        <style dangerouslySetInnerHTML={{ __html: resetCSS }} />
        {unocss.css && (
          <style
            data-unocss={unocss.version}
            dangerouslySetInnerHTML={{ __html: unocss.css }}
          />
        )}
        {styles && styles.map((style) => (
          typeof style === "string"
            ? <style dangerouslySetInnerHTML={{ __html: style }} />
            : <link rel="stylesheet" href={style.href} id={style.id} />
        ))}
        {scripts && scripts.map((script) => (
          typeof script === "string"
            ? <script dangerouslySetInnerHTML={{ __html: script }} />
            : (
              <script src={script.src} type={script.type} id={script.id}>
              </script>
            )
        ))}
      </head>
      <body dangerouslySetInnerHTML={{ __html: body }} />
    </html>
  );
}

export * from "https://esm.sh/preact@10.7.2";
