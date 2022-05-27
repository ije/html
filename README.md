# Htm

Create a `text/html` response with JSX.

```tsx
#!/usr/bin/env -S deno run --allow-net

/** @jsx h  */
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { h, html, tw } from "https://deno.land/x/htm/mod.tsx";

serve((res) => html({
  title: "Hello world!",
  meta: {
    description: "This is a description.",
  },
  body: <p class={tw("text-green-500")}>Hello world!</p>,
}));
```
