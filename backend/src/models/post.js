import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
      required: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 280,
    },

    scheduledAt: Date,
    postedAt: Date,

    status: {
      type: String,
      enum: ['pending', 'posted', 'failed'],
      default: 'pending',
      index: true,
    },

    failureReason: String,
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
