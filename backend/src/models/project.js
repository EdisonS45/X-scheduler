import mongoose from 'mongoose'
const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  twitterApiKey: String,
  twitterApiSecret: String,
  twitterAccessToken: String,
  twitterAccessSecret: String,
  timeGapMinutes: Number,
  status: { type: String, default: 'stopped' }
}, { timestamps: true })

export default mongoose.model('Project', projectSchema)