# Htm

Create a `text/html` response with JSX, powered by [Preact](https://preactjs.org) and [UnoCSS](https://github.com/unocss/unocss).

## Usage

To use **Htm**, create a `server.tsx` file like this:

```tsx
/** @jsx h  */
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { h, html } from "https://deno.land/x/htm/mod.tsx";

serve((res) =>
  html({
    title: "Hello World!",
    meta: {
      description: "This is a description.",
    },
    body: (
      <div class="flex items-center justify-center w-screen h-screen">
        <p class="text-5xl font-bold text-green-600">Hello World!</p>
      </div>
    ),
  })
);
```

## Run the server

```bash
deno run --allow-net server.tsx
```

## Try it online

https://dash.deno.com/playground/hello-world-jsx
