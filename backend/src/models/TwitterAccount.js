// src/models/TwitterAccount.js
import mongoose from 'mongoose';

const twitterAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    twitterUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    username: {
      type: String,
      required: true,
    },

    accessToken: {
      type: String,
      required: true,
      select: false,
    },

    refreshToken: {
      type: String,
      required: true,
      select: false,
    },

    tokenExpiresAt: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastUsedAt: {
      type: Date,
    },

    revokedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Prevent same user linking same account twice
twitterAccountSchema.index({ userId: 1, twitterUserId: 1 }, { unique: true });

export default mongoose.model('TwitterAccount', twitterAccountSchema);
