import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    defaultTimeGapMinutes: {
      type: Number,
      min: 1,
      max: 1440,
    },
  },
  { timestamps: true }
);

templateSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Template', templateSchema);
