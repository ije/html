# Html

Create `text/html` response with JSX.

## Usage

To use **Html**, create a `server.tsx` file like this:

```tsx
/** @jsx h */
import html, { h } from "https://deno.land/x/htm@0.2.2/mod.ts";
import UnoCSS from "https://deno.land/x/htm@0.2.2/plugins/unocss.ts";

// enable UnoCSS
html.use(UnoCSS());

Deno.serve((_req) =>
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

> **Support JSR**: JSX and TSX files are currently not supported in JSR we are
> planning to publish the module to JSR once it supports JSX and TSX. Follow
> https://github.com/jsr-io/jsr/issues/24

**Run the server**:

```bash
deno run --allow-net server.tsx
```

**Try it online**:

https://dash.deno.com/playground/hello-world-jsx

## Using Plugin

**Html** implements a simple plugin system that allows you to hook into the
rendering process and modify the context.

```ts
import html from "https://deno.land/x/htm@0.2.2/mod.ts";

// add a script to the context
html.use((ctx) => {
  ctx.scripts.push(`console.log("Hello plugin!")`);
});
```

We also provide `Unocss` and `ColorScheme` plugins in the repository. For
example, ise the **Unocss** plugin:

```tsx
/** @jsx h */
import html from "https://deno.land/x/htm@0.2.2/mod.ts";
import UnoCSS from "https://deno.land/x/htm@0.2.2/plugins/unocss.ts";

// with default tailwind preset
html.use(UnoCSS());

// customize Unocss
html.use(UnoCSS({
  presets: [/* put your presets here. */],
  // other unocss configurations check https://github.com/unocss/unocss#configurations
}));

html(
  <div class="text-5xl font-bold text-green-600">Hello World!</div>,
);
```

Use the **ColorScheme** plugin:

```tsx
/** @jsx h */
import html, { h } from "https://deno.land/x/htm@0.2.2/mod.ts";
import ColorScheme from "https://deno.land/x/htm@0.2.2/plugins/color-scheme.ts";

// check the color scheme with system settings automatically
html.use(ColorScheme("auto"));

// dark scheme
html.use(ColorScheme("dark"));
```

You can call the `window.setColorScheme` helper function to set the color scheme
in client when the `colorScheme` option is set to `auto`:

```tsx
html(
  <span class="dark:text-white" onclick="setColorScheme('dark')">
    Dark Mode
  </span>,
);
```
