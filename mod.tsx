/** @jsx h */

import { h, type VNode } from "https://esm.sh/preact@10.7.2";
import { renderToString } from "https://esm.sh/preact-render-to-string@5.2.0?deps=preact@10.7.2";
import { setup, tw } from "https://esm.sh/twind@0.16.17";
import {
  getStyleTagProperties,
  virtualSheet,
} from "https://esm.sh/twind@0.16.17/sheets";

const sheet = virtualSheet();
const twPreflight =
  `button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;margin:0;padding:0;line-height:inherit;color:inherit}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"}table{text-indent:0;border-color:inherit;border-collapse:collapse}hr{height:0;color:inherit;border-top-width:1px}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}button{background-color:transparent;background-image:none}body{font-family:inherit;line-height:inherit}*,::before,::after{box-sizing:border-box;border:0 solid #e5e7eb}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}::-moz-focus-inner{border-style:none;padding:0}[type="search"]{-webkit-appearance:textfield;outline-offset:-2px}pre,code,kbd,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-size:1em}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}body,blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre,fieldset,ol,ul{margin:0}button:focus{outline:1px dotted;outline:5px auto -webkit-focus-ring-color}fieldset,ol,ul,legend{padding:0}textarea{resize:vertical}button,[role="button"]{cursor:pointer}:-moz-focusring{outline:1px dotted ButtonText}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}summary{display:list-item}:root{-moz-tab-size:4;tab-size:4}ol,ul{list-style:none}img{border-style:solid}button,select{text-transform:none}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}abbr[title]{-webkit-text-decoration:underline dotted;text-decoration:underline dotted}b,strong{font-weight:bolder}sub{bottom:-0.25em}sup{top:-0.5em}button,[type="button"],[type="reset"],[type="submit"]{-webkit-appearance:button}::-webkit-search-decoration{-webkit-appearance:none}`;

setup({ sheet, preflight: false });

export type HtmlProps = {
  title?: string;
  meta?: Record<string, string>;
  styles?: (string | { href: string })[];
  scripts?: (string | { src: string; type?: string })[];
  children: VNode;
};

export function Html(props: HtmlProps) {
  const twStyle = getStyleTagProperties(sheet);
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {props.title && <title>{props.title}</title>}
        {props.meta &&
          Object.entries(props.meta).map(([name, content]) => (
            <meta name={name} content={content} />
          ))}
        {twStyle.textContent && (
          <style
            id="__twind_prefiligh"
            dangerouslySetInnerHTML={{ __html: twPreflight }}
          />
        )}
        {twStyle.textContent && (
          <style
            id={twStyle.id}
            dangerouslySetInnerHTML={{ __html: twStyle.textContent }}
          />
        )}
        {props.styles && props.styles.map((style) => (
          typeof style === "string"
            ? <style dangerouslySetInnerHTML={{ __html: style }} />
            : <link rel="stylesheet" href={style.href} />
        ))}
        {props.scripts && props.scripts.map((script) => (
          typeof script === "string"
            ? <script dangerouslySetInnerHTML={{ __html: script }} />
            : <script src={script.src} type={script.type}></script>
        ))}
      </head>
      <body>{props.children}</body>
    </html>
  );
}

export type Options = {
  body: VNode;
  status?: number;
  headers?: HeadersInit;
} & Omit<HtmlProps, "children">;

export function html(options: Options): Response {
  const { body, status, headers: headersInit, ...rest } = options;
  const headers = new Headers(headersInit);
  headers.append("Content-Type", "text/html; charset=utf-8");
  const res = new Response(
    renderToString(
      <Html {...rest}>
        {body}
      </Html>,
    ),
    {
      status,
      headers,
    },
  );

  // Reset the sheet for a new rendering
  sheet.reset();

  return res;
}

export { tw };

export * from "https://esm.sh/preact@10.7.2";
