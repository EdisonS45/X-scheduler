import crypto from 'crypto';

export const generateOAuthState = () => {
  return crypto.randomBytes(16).toString('hex');
};

export const buildTwitterAuthUrl = (state) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: process.env.TWITTER_REDIRECT_URI,
    scope: 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge: 'challenge',
    code_challenge_method: 'plain',
  });

  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
};
