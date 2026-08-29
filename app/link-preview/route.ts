import { resolvePreviewMetadata } from "@/lib/link-preview-metadata";
import { getSiteOrigin } from "@/lib/site-url";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Serves a bare HTML document with just Open Graph metadata for the
// original protected URL a preview-bot request was rewritten from (see
// middleware) — never the real page content. Board names are the only
// per-page detail exposed; see resolvePreviewMetadata for the scope.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "/";
  const origin = await getSiteOrigin();
  const { title, description } = await resolvePreviewMetadata(path);
  const pageUrl = `${origin}${path}`;
  const imageUrl = `${origin}/logo.png`;

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(pageUrl)}">
<meta property="og:image" content="${escapeHtml(imageUrl)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary">
</head>
<body></body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
