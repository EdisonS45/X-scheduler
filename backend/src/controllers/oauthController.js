import OAuthState from '../models/OAuthState.js';
import TwitterAccount from '../models/TwitterAccount.js';
import { getOAuthClient } from '../utils/twitterClient.js';

/**
 * STEP 1: Start Twitter OAuth
 */
export const startTwitterOAuth = async (req, res) => {
    const client = getOAuthClient();

    const { url, codeVerifier, state } =
        client.generateOAuth2AuthLink(process.env.TWITTER_CALLBACK_URL, {
            scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        });

    // Store state in DB (10 min expiry)
    await OAuthState.create({
        userId: req.user.id,
        provider: 'twitter',
        state,
        codeVerifier,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    res.json({ url });
};

/**
 * STEP 2: Twitter OAuth Callback
 */
export const finishTwitterOAuth = async (req, res) => {
    const { state, code } = req.query;

    if (!state || !code) {
        return res.status(400).json({ message: 'Missing OAuth params' });
    }

    const oauthState = await OAuthState.findOne({ state });

    if (!oauthState) {
        return res.status(400).json({ message: 'Invalid or expired OAuth state' });
    }

    const client = getOAuthClient();

    const {
        accessToken,
        refreshToken,
        expiresIn,
    } = await client.loginWithOAuth2({
        code,
        codeVerifier: oauthState.codeVerifier,
        redirectUri: process.env.TWITTER_CALLBACK_URL,
    });

    const twitterUser = await client.v2.me();

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

    // Cleanup
    await OAuthState.deleteOne({ _id: oauthState._id });

    res.json({ connected: true, account });
};
