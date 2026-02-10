import { TwitterApi } from 'twitter-api-v2';

export const getOAuthClient = () => {
  const {
    TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET,
  } = process.env;

  if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
    throw new Error('Twitter OAuth env vars missing');
  }

  return new TwitterApi({
    clientId: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET,
  });
};

/**
 * Create a client from stored user tokens (AFTER OAuth)
 */
export const getUserClient = ({ accessToken, refreshToken }) => {
  return new TwitterApi({
    accessToken,
    refreshToken,
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  });
};
