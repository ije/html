# Html

Create `text/html` response with JSX.

## Usage

To use **Html**, create a `server.tsx` file like this:

```tsx
/** @jsx h */
import html, { h } from "jsr:@ije/html";

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
    styles: [
      `div { display: flex; }`,
    ],
    scripts: [
      `console.log("Hello World!")`,
    ],
    body: (
      <div>
        <h1>Hello World!</h1>
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

## Using Plugin

**Html** implements a simple plugin system that allows you to hook into the
rendering process and modify the context.

```ts
import html from "jsr:@ije/html";

// add a script to the context
html.use((ctx) => {
  ctx.scripts.push(`console.log("Hello plugin!")`);
});
```

We provide `Unocss` and `ColorScheme` plugins in the repository. For example,
use the **Unocss** plugin:

```tsx
/** @jsx h */
import html from "jsr:@ije/html";
import UnoCSS from "jsr:@ije/html/plugins/unocss";

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
import html, { h } from "jsr:@ije/html";
import ColorScheme from "jsr:@ije/html/plugins/color-scheme";

// check the color scheme with system settings automatically
html.use(ColorScheme("auto"));

// dark scheme
html.use(ColorScheme("dark"));
```

You can call the `window.setColorScheme` helper function to set the color scheme
in client when the `colorScheme` option is set to `auto`:

```tsx
html(
  <button class="dark:text-white" onclick="setColorScheme('dark')">
    Dark Mode
  </button>,
);
```
