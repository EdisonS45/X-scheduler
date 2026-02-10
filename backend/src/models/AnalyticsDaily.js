import mongoose from 'mongoose';

const analyticsDailySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },

    postsScheduled: { type: Number, default: 0 },
    postsPosted: { type: Number, default: 0 },
    postsFailed: { type: Number, default: 0 },
    activeProjects: { type: Number, default: 0 },
  },
  { timestamps: true }
);

analyticsDailySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('AnalyticsDaily', analyticsDailySchema);
