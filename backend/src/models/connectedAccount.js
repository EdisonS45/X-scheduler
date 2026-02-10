import mongoose from 'mongoose'

const connectedAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    provider: {
      type: String,
      enum: ['twitter'],
      required: true
    },

    providerUserId: {
      type: String,
      required: true
    },

    accessToken: {
      type: String,
      required: true
    },

    refreshToken: String,

    expiresAt: Date,

    status: {
      type: String,
      enum: ['active', 'expired', 'revoked'],
      default: 'active'
    }
  },
  { timestamps: true }
)

// One account per provider per user
connectedAccountSchema.index(
  { userId: 1, provider: 1 },
  { unique: true }
)

export default mongoose.model('ConnectedAccount', connectedAccountSchema)
