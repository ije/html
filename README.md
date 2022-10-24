# Htm

Create a `text/html` response with JSX, powered by
[Preact](https://preactjs.org) and [UnoCSS](https://github.com/unocss/unocss).

## Usage

To use **Htm**, create a `server.tsx` file like this:

```tsx
/** @jsx h  */
import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
import { h, html } from "https://deno.land/x/htm/mod.tsx";
import UnoCSS from "https://deno.land/x/htm/plugins/unocss.ts";

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

## Plugin System

**Htm** supports plugin system. We provide `Unocss` and `ColorScheme` plugins
offically:

Use the **Unocss** plugin:

```tsx
import { html } from "https://deno.land/x/htm/mod.tsx";
import UnoCSS from "https://deno.land/x/htm/plugins/unocss.ts";

// with default tailwind preset
html.use(UnoCSS());

// customize Unocss
html.use(UnoCSS({
  presets: [/* put your presets here. */],
  // other unocss configurations check https://github.com/unocss/unocss#configurations
}));

html({
  body: <div class="text-5xl font-bold text-green-600">Hello World!</div>,
});
```

Use the **ColorScheme** plugin:

```tsx
import { html } from "https://deno.land/x/htm/mod.tsx";
import ColorScheme from "https://deno.land/x/htm/plugins/color-scheme.ts";

// check the color scheme with system settings automatically
html.use(ColorScheme("auto"));

// dark scheme
html.use(ColorScheme("dark"));
```

You call the `window.setColorScheme` helper function to set the color scheme in
client when the `colorScheme` option is set to `auto`:

```tsx
html({
  body: (
    <span class="dark:text-white" onclick="setColorScheme('dark')">
      Dark Mode
    </span>
  ),
});
```

Or **create** your own plugins:

```ts
import { html } from "https://deno.land/x/htm/mod.tsx";

html.use((ctx) => {
  // update ctx
  ctx.scripts = [`console.log("Hello plugin!")`, ...(ctx.scripts ?? [])];
});
```
