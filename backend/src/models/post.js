import mongoose from 'mongoose'
const postSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  content: String,
  scheduledAt: Date,
  postedAt: Date,
  status: { type: String, enum: ['pending','posted','failed'], default: 'pending' }
})
export default mongoose.model('Post', postSchema)