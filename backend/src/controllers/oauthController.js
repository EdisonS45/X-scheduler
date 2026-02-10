import TwitterAccount from '../models/TwitterAccount.js';
import { getOAuthClient } from '../utils/twitterClient.js';

/**
 * Step 1: Redirect user to Twitter OAuth
 */
export const startTwitterOAuth = async (req, res) => {
  const client = getOAuthClient();

  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
    process.env.TWITTER_CALLBACK_URL,
    { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] }
  );

  req.session.twitterOAuth = { codeVerifier, state };

  res.json({ url });
};

/**
 * Step 2: Twitter callback
 */
export const finishTwitterOAuth = async (req, res) => {
  const { state, code } = req.query;
  const session = req.session.twitterOAuth;

  if (!session || session.state !== state) {
    return res.status(400).json({ message: 'Invalid OAuth state' });
  }

  const client = getOAuthClient();
  const { accessToken, refreshToken, expiresIn } =
    await client.loginWithOAuth2({
      code,
      codeVerifier: session.codeVerifier,
      redirectUri: process.env.TWITTER_CALLBACK_URL,
    });

  const twitterUser = await client.v2.me();

  const account = await TwitterAccount.findOneAndUpdate(
    { twitterUserId: twitterUser.data.id },
    {
      userId: req.user.id,
      username: twitterUser.data.username,
      accessToken,
      refreshToken,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      isActive: true,
    },
    { upsert: true, new: true }
  );

  res.json({ connected: true, account });
};
