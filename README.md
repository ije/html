# Htm

Create a `text/html` response with JSX, powered by
[Preact](https://preactjs.org) and [UnoCSS](https://github.com/unocss/unocss).

## Usage

To use **Htm**, create a `server.tsx` file like this:

```jsx
/** @jsx h  */
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { h, html } from "https://deno.land/x/htm/mod.tsx";

serve((res) =>
  html({
    lang: "en",
    title: "Hello World!",
    meta: {
      description: "This is a description.",
    },
    links: [
      { rel: "mask-icon", href: "/logo.svg", color: "#ffffff" },
    ],
    styles: [
      "*{margin:0;padding:0}",
      { href: "/style.css" },
    ],
    scripts: [
      "console.log('Hello World!')",
      { src: "/script.js", type: "module" },
    ],
    body: (
      <div class="flex items-center justify-center w-screen h-screen">
        <p class="text-5xl font-bold text-green-600">Hello World!</p>
      </div>
    ),
  })
);
```

## Dark Mode

**htm** will automatically detect if the browser is in dark mode. Or you can set
it manually:

```js
html({
  dark: true,
  ...
});
```

You also can set the `color-scheme` in the client by calling the `window.setColorScheme` method:

```js
html({
  body: (
    <div class="flex items-center justify-center w-screen h-screen">
      <span class="dark:text-white" onclick="setColorScheme('dark')">
        Dark Mode
      </span>
    </div>
  ),
});
```

## Run the server

```bash
deno run --allow-net server.tsx
```

## Try it online

https://dash.deno.com/playground/hello-world-jsx
