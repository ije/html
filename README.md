# Htm

Create a `text/html` response with JSX, powered by
[Preact](https://preactjs.org) and [UnoCSS](https://github.com/unocss/unocss).

## Usage

To use **Htm**, create a `server.tsx` file like this:

```tsx
/** @jsx h  */
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { h, html } from "https://deno.land/x/htm/mod.tsx";
import { UnoCSS } from "https://deno.land/x/htm/plugins.ts";

// enable UnoCSS
html.use(UnoCSS());

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
    scripts: [
      `console.log("Hello World!")`,
    ],
    body: (
      <div class="flex items-center justify-center w-screen h-screen">
        <p class="text-5xl font-bold text-green-600">Hello World!</p>
      </div>
    ),
  })
);
```

**Run the server**:

```bash
deno run --allow-net server.tsx
```

**Try it online**:

https://dash.deno.com/playground/hello-world-jsx

## Color Scheme

**Htm** supports
[prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
out of the box:

```tsx
html({
  colorScheme: "dark", // or "light" or "auto", default "light"
  ...
});
```

You call the `window.setColorScheme` helper function to set the color scheme in
client when the `colorScheme` option is set to `auto`:

```tsx
html({
  colorScheme: "auto",
  body: (
    <span class="dark:text-white" onclick="setColorScheme('dark')">
      Dark Mode
    </span>
  ),
});
```

## Plugin System

**Htm** supports plugin system.

```ts
import { html } from "https://deno.land/x/htm/mod.tsx";
import { UnoCSS } from "https://deno.land/x/htm/plugins.ts";

html.use(UnoCSS());
```

Create your own plugin:

```ts
import { html } from "https://deno.land/x/htm/mod.tsx";

html.use((ctx) => {
  // update ctx
  ctx.scripts = [`console.log("Hello plugin!")`, ...(ctx.scripts ?? [])];
});
```
