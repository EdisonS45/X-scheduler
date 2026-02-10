import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },

    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },

    postedAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ['scheduled', 'posted', 'failed'],
      default: 'scheduled',
      index: true,
    },

    errorMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
