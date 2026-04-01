const BOT_USER_AGENT_PATTERN =
  /bot|crawler|spider|googlebot|google-inspectiontool|bingbot|duckduckbot|slurp|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|headlesschrome|lighthouse|chrome-lighthouse/i;

function isLikelyBotUserAgent(userAgent?: string): boolean {
  if (!userAgent) {
    return false;
  }

  return BOT_USER_AGENT_PATTERN.test(userAgent);
}

export function isAutomatedClient(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return navigator.webdriver || isLikelyBotUserAgent(navigator.userAgent);
}
