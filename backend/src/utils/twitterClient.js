import { TwitterApi } from 'twitter-api-v2';

/**
 * OAuth client (NO user tokens here)
 * Used only for connect / refresh flows
 */
export const getOAuthClient = () => {
  if (
    !process.env.TWITTER_CLIENT_ID ||
    !process.env.TWITTER_CLIENT_SECRET
  ) {
    throw new Error('Twitter OAuth env vars missing');
  }

  return new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  });
};

/**
 * Post a tweet on behalf of a connected Twitter account
 * Uses stored access + refresh tokens
 */
export const postToTwitter = async (account, content) => {
  if (!account?.accessToken) {
    throw new Error('Twitter account not connected');
  }

  const client = new TwitterApi({
    accessToken: account.accessToken,
    refreshToken: account.refreshToken,
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  });

  // Automatically refresh token if needed
  const rwClient = client.readWrite();

  await rwClient.v2.tweet(content);
};
