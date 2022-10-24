import type { Plugin } from "../mod.tsx";

export default function ColorScheme(colorScheme: "dark" | "auto"): Plugin {
  return (ctx) => {
    if (colorScheme === "dark") {
      ctx.classes = {
        ...ctx.classes,
        html: ["dark", ...(ctx.classes?.html ?? [])],
      };
    }
    ctx.styles = [
      `.dark{color-scheme:dark}.dark ::-moz-selection{background:#444}.dark ::selection{background:#444}`,
      ...(ctx.styles ?? []),
    ];
    if (colorScheme === "auto") {
      ctx.scripts = [
        `(()=>{let v=localStorage.getItem("color-scheme"),a=window.matchMedia("(prefers-color-scheme: dark)").matches,cl=document.documentElement.classList,setColorScheme=v=>(!v||v==="auto"?a:v==="dark")?cl.add("dark"):cl.remove("dark");setColorScheme(v);window.setColorScheme=v=>{setColorScheme(v);localStorage.setItem("color-scheme",v)};})();`,
        ...(ctx.scripts ?? []),
      ];
    }
  };
}
