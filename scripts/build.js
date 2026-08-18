// Builds a static HTML preview of the GitHub profile README.
// Usage: node scripts/build.js  (writes dist/index.html)

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrap(body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Abhinaba Das — Profile</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0d1117;
      --fg: #e6edf3;
      --muted: #8b949e;
      --accent: #ff5500;
      --border: #30363d;
      --code-bg: #161b22;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--fg);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      line-height: 1.6;
    }
    main {
      max-width: 920px;
      margin: 0 auto;
      padding: 40px 24px 80px;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; }
    h1, h2, h3, h4 { margin: 1.6em 0 0.6em; line-height: 1.25; }
    h1 { font-size: 1.9em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
    h3 { font-size: 1.2em; }
    p { margin: 0.8em 0; }
    ul, ol { padding-left: 1.6em; }
    li { margin: 0.25em 0; }
    pre {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px 16px;
      overflow-x: auto;
      font-size: 0.88em;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      font-size: 0.9em;
    }
    :not(pre) > code {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.15em 0.35em;
    }
    blockquote {
      margin: 0.8em 0;
      padding: 0.2em 1em;
      border-left: 4px solid var(--border);
      color: var(--muted);
    }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
    th { background: var(--code-bg); }
    tr:nth-child(even) td { background: rgba(255, 255, 255, 0.02); }
    hr { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
    .banner {
      text-align: center;
      margin: 0 0 2em;
      font-size: 0.9em;
      color: var(--muted);
    }
    .banner a { color: var(--muted); }
  </style>
</head>
<body>
  <main>
    <div class="banner">Preview of <strong>README.MD</strong> from <a href="https://github.com/abhinaba75/abhinaba75">github.com/abhinaba75/abhinaba75</a></div>
    ${body}
  </main>
</body>
</html>
`;
}

export async function build() {
  const md = await readFile(join(ROOT, "README.MD"), "utf8");

  let body;
  try {
    const { marked } = await import("marked");
    body = marked.parse(md, { gfm: true, breaks: false });
  } catch {
    // Fallback if `marked` was not installed: show the raw markdown.
    body = `<pre>${escapeHtml(md)}</pre>`;
  }

  const outDir = join(ROOT, "dist");
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "index.html"), wrap(body));
}

const isMain =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  build()
    .then(() => console.log("Built dist/index.html from README.MD"))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
