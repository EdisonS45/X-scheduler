import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    passwordHash: {
      type: String,
      select: false, // never returned unless explicitly requested
    },

    authProvider: {
      type: String,
      enum: ['local', 'twitter', 'google', 'github'],
      default: 'local',
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    plan: {
      type: String,
      enum: ['free', 'pro', 'team'],
      default: 'free',
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
