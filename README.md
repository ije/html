# Htm

Create a `text/html` response with JSX and [Unocss](https://github.com/unocss/unocss).

```tsx
#!/usr/bin/env -S deno run --allow-net

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
