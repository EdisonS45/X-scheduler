import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    twitterAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TwitterAccount',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    timeGapMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 1440,
    },

    status: {
      type: String,
      enum: ['stopped', 'running', 'paused'],
      default: 'stopped',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Project', projectSchema);
