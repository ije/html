# Html

Create `text/html` response with JSX.

## Usage

To use **Html**, create a `server.tsx` file like this:

```tsx
/** @jsx h */
import { serve } from "https://deno.land/std@0.180.0/http/server.ts";
import html, { h } from "https://deno.land/x/htm@0.2.0/mod.ts";
import UnoCSS from "https://deno.land/x/htm@0.2.0/plugins/unocss.ts";

// enable UnoCSS
html.use(UnoCSS());

serve((_req) =>
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

**Html** supports plugins system. We provide `Unocss` and `ColorScheme` plugins
in the repository.

Use the **Unocss** plugin:

```tsx
/** @jsx h */
import html from "https://deno.land/x/htm@0.2.0/mod.ts";
import UnoCSS from "https://deno.land/x/htm@0.2.0/plugins/unocss.ts";

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
import html, { h } from "https://deno.land/x/htm@0.2.0/mod.ts";
import ColorScheme from "https://deno.land/x/htm@0.2.0/plugins/color-scheme.ts";

// check the color scheme with system settings automatically
html.use(ColorScheme("auto"));

// dark scheme
html.use(ColorScheme("dark"));
```

You call the `window.setColorScheme` helper function to set the color scheme in
client when the `colorScheme` option is set to `auto`:

```tsx
html(
  <span class="dark:text-white" onclick="setColorScheme('dark')">
    Dark Mode
  </span>,
);
```

Or **create** your own plugins:

```ts
import html from "https://deno.land/x/htm@0.2.0/mod.ts";

html.use((ctx) => {
  // update ctx
  ctx.scripts = [`console.log("Hello plugin!")`, ...(ctx.scripts ?? [])];
});
```
