import mongoose from 'mongoose'

const templateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  twitterApiKey: String,
  twitterApiSecret: String,
  twitterAccessToken: String,
  twitterAccessSecret: String,
}, { timestamps: true })

// Add an index to prevent duplicate template names per user
templateSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Template', templateSchema)