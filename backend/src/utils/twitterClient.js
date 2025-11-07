import { TwitterApi } from 'twitter-api-v2'

export const postToTwitter = async (project, content) => {
  // project contains twitterApiKey, twitterApiSecret, twitterAccessToken, twitterAccessSecret
  // NOTE: ensure you have proper developer access. For testing, you can mock this function.
  if(!project.twitterApiKey) {
    console.log('No API key configured for project, skipping (mock)')
    return
  }

  const client = new TwitterApi({
    appKey: project.twitterApiKey,
    appSecret: project.twitterApiSecret,
    accessToken: project.twitterAccessToken,
    accessSecret: project.twitterAccessSecret,
  })

  // v2 tweet
  await client.v2.tweet(content)
}