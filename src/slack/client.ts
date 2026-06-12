import { WebClient, LogLevel } from "@slack/web-api";

export class SlackClient {
  private web: WebClient;
  private allowedChannels: Set<string>;

  constructor(token: string, allowedChannels: string[]) {
    this.web = new WebClient(token, { logLevel: LogLevel.ERROR });
    this.allowedChannels = new Set(allowedChannels);
  }

  get sdk(): WebClient {
    return this.web;
  }

  isChannelAllowed(channelIdOrName: string): boolean {
    // Wildcard mode (empty set) allows every channel
    return this.allowedChannels.size === 0 || this.allowedChannels.has(channelIdOrName);
  }

  listAllowedChannels(): string[] {
    return Array.from(this.allowedChannels);
  }
}

// Check env variables
if (!process.env.SLACK_AUTH_USER_TOKEN) {
  throw new Error("SLACK_AUTH_USER_TOKEN environment variable is not set");
}
if (!process.env.SLACK_SEARCH_CHANNELS) {
  throw new Error("SLACK_SEARCH_CHANNELS environment variable is not set");
}

// Split channels by comma. "*" disables channel filtering: no in:<channel>
// terms are appended to search queries, so search covers the entire
// workspace visible to the token (public + private channels + DMs).
export let searchChannels =
  process.env.SLACK_SEARCH_CHANNELS === "*"
    ? []
    : process.env.SLACK_SEARCH_CHANNELS.split(",");
// Remove leading and trailing spaces as well as #
searchChannels = searchChannels.map(c => c.trim().replace("#", ""));
// Check if channel count is greater than 0
if (process.env.SLACK_SEARCH_CHANNELS !== "*" && !(searchChannels.length > 0)) {
  throw new Error("SLACK_SEARCH_CHANNELS must contain at least one channel");
}

export const slackClient = new SlackClient(process.env.SLACK_AUTH_USER_TOKEN, searchChannels);