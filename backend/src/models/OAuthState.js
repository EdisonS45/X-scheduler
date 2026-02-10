import mongoose from 'mongoose';

const oauthStateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ['twitter'],
      required: true,
    },

    state: {
      type: String,
      required: true,
      unique: true,
    },

    codeVerifier: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL auto-delete
    },
  },
  { timestamps: true }
);

export default mongoose.model('OAuthState', oauthStateSchema);
