import mongoose from 'mongoose';

const twitterAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },

    twitterUserId: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    displayName: String,
    profileImageUrl: String,

    // OAuth tokens
    accessToken: {
      type: String,
      required: true,
      select: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    tokenExpiresAt: Date,

    isActive: {
      type: Boolean,
      default: true,
    },

    lastUsedAt: Date,
  },
  { timestamps: true }
);

// One Twitter account cannot be connected twice by same user
twitterAccountSchema.index(
  { userId: 1, twitterUserId: 1 },
  { unique: true }
);

export default mongoose.model('TwitterAccount', twitterAccountSchema);
