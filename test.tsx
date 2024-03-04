/**  @jsx h  */
import html, { h, type Plugin } from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.217.0/assert/mod.ts";

Deno.test("without options", async () => {
  const res = await html(<h1>Hello</h1>);
  assertEquals(res.headers.get("content-type"), "text/html; charset=utf-8");
  assertEquals(
    await res.text(),
    `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"></head><body><h1>Hello</h1></body></html>`,
  );

  const res2 = await html("<h1>Hello</h1>");
  assertEquals(res2.headers.get("content-type"), "text/html; charset=utf-8");
  assertEquals(
    await res2.text(),
    `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"></head><body><h1>Hello</h1></body></html>`,
  );
});

Deno.test("with options", async () => {
  const res = await html({
    lang: "html",
    title: "Hello",
    classes: {
      html: ["h", "dark", false && "never"],
      body: ["b", "bg-black", false && "never"],
    },
    meta: {
      description: "Hello",
      never: false,
    },
    links: [
      false && "never",
      { rel: "icon", href: "/favicon.ico" },
    ],
    styles: [
      false && "never",
      `.bg-black{background-color:black}`,
      {
        href: "style.css",
      },
    ],
    scripts: [
      false && "never",
      `console.log("Hello")`,
      {
        src: "main.mjs",
        type: "module",
      },
    ],
    body: <h1>Hello</h1>,
  });
  assertEquals(res.headers.get("content-type"), "text/html; charset=utf-8");
  assertEquals(
    await res.text(),
    [
      `<!DOCTYPE html><html lang="html" class="h dark">`,
      `<head><meta charSet="utf-8"><title>Hello</title>`,
      `<meta name="description" content="Hello">`,
      `<link rel="icon" href="/favicon.ico">`,
      `<style>.bg-black{background-color:black}</style>`,
      `<link rel="stylesheet" href="style.css">`,
      `<script>console.log("Hello")</script>`,
      `<script type="module" src="main.mjs"></script>`,
      `</head><body class="b bg-black"><h1>Hello</h1></body></html>`,
    ].join(""),
  );
});

Deno.test("with plugin", async () => {
  const plugin: Plugin & { disabled?: boolean } = (ctx) => {
    if (plugin.disabled) return;
    ctx.lang = "html";
    ctx.title = "Hello";
    ctx.classes.html.push("h", "dark");
    ctx.classes.body.push("b", "bg-black");
    ctx.meta.description = "Hello";
    ctx.links.push({ rel: "icon", href: "/favicon.ico" });
    ctx.styles.push(`.bg-black{background-color:black}`);
    ctx.styles.push({ href: "style.css" });
    ctx.scripts.push(`console.log("Hello")`);
    ctx.scripts.push({ src: "main.mjs", type: "module" });
    ctx.headers.set("x-plugin", "true");
  };
  const expectedHtml = [
    `<!DOCTYPE html><html lang="html" class="h dark">`,
    `<head><meta charSet="utf-8"><title>Hello</title>`,
    `<meta name="description" content="Hello">`,
    `<link rel="icon" href="/favicon.ico">`,
    `<style>.bg-black{background-color:black}</style>`,
    `<link rel="stylesheet" href="style.css">`,
    `<script>console.log("Hello")</script>`,
    `<script type="module" src="main.mjs"></script>`,
    `</head><body class="b bg-black"><h1>Hello</h1></body></html>`,
  ].join("");
  html.use(plugin);

  const res1 = await html({
    body: <h1>Hello</h1>,
    plugins: [plugin],
  });
  assertEquals(res1.headers.get("content-type"), "text/html; charset=utf-8");
  assertEquals(res1.headers.get("x-plugin"), "true");
  assertEquals(await res1.text(), expectedHtml);

  const res2 = await html({
    body: <h1>Hello</h1>,
    plugins: [plugin],
  });
  assertEquals(res2.headers.get("content-type"), "text/html; charset=utf-8");
  assertEquals(res1.headers.get("x-plugin"), "true");
  assertEquals(await res2.text(), expectedHtml);

  plugin.disabled = true;
});

Deno.test("using custom http status", async () => {
  const res = await html({
    status: 404,
    body: <h1>Not Found</h1>,
  });
  assertEquals(res.status, 404);
  assertEquals(
    await res.text(),
    `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"></head><body><h1>Not Found</h1></body></html>`,
  );
});

Deno.test("adding custom http headers", async () => {
  const res = await html({
    headers: new Headers({
      "x-custom-header": "hello",
    }),
    body: <h1>Hello</h1>,
  });
  assertEquals(res.headers.get("x-custom-header"), "hello");
  assertEquals(
    await res.text(),
    `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"></head><body><h1>Hello</h1></body></html>`,
  );
});
