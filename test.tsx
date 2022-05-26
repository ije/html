/**  @jsx h  */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { h, html, tw } from "./mod.tsx";

serve(
  (res) => {
    return html({
      title: "Hello world",
      body: <p class={tw("text-green-500")}>Hello world</p>,
    });
  },
  { port: 8000 },
);
