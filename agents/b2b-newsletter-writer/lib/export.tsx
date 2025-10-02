import type { Newsletter } from "./newsletterAgent"

export function newsletterToHTML(n: Newsletter): string {
  // Minimal semantic HTML; safe for email export starting point
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>${escapeHtml(n.subject)}</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.55; margin:0; padding:24px; color:#111; background:#fff; }
      .container { max-width: 680px; margin: 0 auto; }
      h1 { font-size: 24px; margin: 0 0 16px; }
      p { margin: 0 0 12px; }
      .cta { display:inline-block; margin-top:16px; padding:12px 16px; background:#0ea5e9; color:#fff; text-decoration:none; border-radius:6px; }
    </style>
  </head>
  <body>
    <main class="container">
      <h1>${escapeHtml(n.subject)}</h1>
      ${paragraphsToHtml(n.shortBody)}
      br
      ${paragraphsToHtml(n.longBody)}
      <p><a class="cta" href="#">${escapeHtml(n.cta)}</a></p>
    </main>
  </body>
</html>`
}

export function newsletterToMarkdown(n: Newsletter): string {
  return `# ${n.subject}

${n.shortBody}

${n.longBody}

**Call to Action:** ${n.cta}
`
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function paragraphsToHtml(body: string) {
  return body
    .split(/\n{2,}/g)
    .map((block) => `<p>${escapeHtml(block.trim())}</p>`)
    .join("\n")
}
