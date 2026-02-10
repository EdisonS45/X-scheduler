import { TwitterApi } from 'twitter-api-v2';

/**
 * OAuth client used for PKCE login
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
 * Returns an authenticated client for a user
 * Handles OAuth2 refresh correctly
 */
export const getUserClient = async (twitterAccount) => {
  const { refreshToken } = twitterAccount;

  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const baseClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  });

  const {
    client,
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn,
  } = await baseClient.refreshOAuth2Token(refreshToken);

  // 🔁 rotate tokens (VERY important for production)
  twitterAccount.accessToken = accessToken;
  twitterAccount.refreshToken = newRefreshToken;
  twitterAccount.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
  await twitterAccount.save();

  return client;
};

/**
 * Safe tweet posting (used by workers)
 */
export const postToTwitter = async (twitterAccount, content) => {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid tweet content');
  }

  try {
    const client = await getUserClient(twitterAccount);
    await client.v2.tweet(content);
  } catch (err) {
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
