import { TwitterApi } from 'twitter-api-v2';
import OAuthState from '../models/OAuthState.js';
import TwitterAccount from '../models/TwitterAccount.js';
import { getOAuthClient } from '../utils/twitterClient.js';

export const finishTwitterOAuth = async (req, res) => {
  const { state, code } = req.query;

  if (!state || !code) {
    return res.status(400).json({ message: 'Missing OAuth params' });
  }

  const oauthState = await OAuthState.findOne({ state });
  if (!oauthState) {
    return res.status(400).json({ message: 'Invalid or expired OAuth state' });
  }

  const oauthClient = getOAuthClient();

  const {
    accessToken,
    refreshToken,
    expiresIn,
  } = await oauthClient.loginWithOAuth2({
    code,
    codeVerifier: oauthState.codeVerifier,
    redirectUri: process.env.TWITTER_CALLBACK_URL,
  });

  // ✅ IMPORTANT: create USER client
  const userClient = new TwitterApi(accessToken);

  const twitterUser = await userClient.v2.me();

  const account = await TwitterAccount.findOneAndUpdate(
    { twitterUserId: twitterUser.data.id },
    {
      userId: oauthState.userId,
      username: twitterUser.data.username,
      accessToken,
      refreshToken,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      isActive: true,
    },
    { upsert: true, new: true }
  );

  await OAuthState.deleteOne({ _id: oauthState._id });

  res.json({ connected: true, account });
};
