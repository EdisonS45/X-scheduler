import { TwitterApi } from 'twitter-api-v2';

/**
 * OAuth client used ONLY for login / token exchange (PKCE)
 */
export const getOAuthClient = () => {
  const { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } = process.env;

  if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
    throw new Error('Twitter OAuth env vars missing');
  }

  return new TwitterApi({
    clientId: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET,
  });
};

/**
 * Authenticated client for a connected Twitter account
 * Used for posting tweets, fetching user data, etc.
 */
export const getUserClient = ({ accessToken, refreshToken }) => {
  if (!accessToken || !refreshToken) {
    throw new Error('Missing Twitter account tokens');
  }

  return new TwitterApi({
    accessToken,
    refreshToken,
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  });
};

/**
 * Post a tweet on behalf of a connected Twitter account
 * This is what your worker / scheduler will call
 */
export const postToTwitter = async (twitterAccount, content) => {
  if (!content || typeof content !== 'string') {
    throw new Error('Tweet content is invalid');
  }

  const client = getUserClient({
    accessToken: twitterAccount.accessToken,
    refreshToken: twitterAccount.refreshToken,
  });

  try {
    await client.v2.tweet(content);
  } catch (err) {
    /**
     * Important: normalize Twitter errors so workers can retry safely
     */
    const message =
      err?.data?.detail ||
      err?.data?.title ||
      err?.message ||
      'Twitter API error';

    const error = new Error(message);
    error.code = err.code;
    throw error;
  }
};
