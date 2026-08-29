// Apple's iMessage link-preview fetcher spoofs Facebook/Twitter's bot UA
// (a known, documented quirk), so a standard bot allowlist covers it too.
// Kept dependency-free (no service client) since middleware imports this
// directly and runs on the Edge runtime.
const BOT_UA_PATTERN =
  /facebookexternalhit|Twitterbot|Slackbot|LinkedInBot|WhatsApp|TelegramBot|Discordbot|SkypeUriPreview|redditbot/i;

export function isLinkPreviewBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_UA_PATTERN.test(userAgent);
}
