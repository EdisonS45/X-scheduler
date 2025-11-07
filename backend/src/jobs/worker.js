import { Worker } from 'bullmq'
import { redis } from '../config/redis.js'
import Post from '../models/post.js'
import Project from '../models/project.js'
import { postToTwitter } from '../utils/twitterClient.js'

// A small helper to create a worker for any queue name
export const createWorker = (projectId) => {
 const worker = new Worker(`queue_${projectId}`, async (job) => {
    const { postId, content } = job.data
    const post = await Post.findById(postId)
    if(!post) return
    const project = await Project.findById(projectId)

    try{
      // Use the project's credentials to post
      await postToTwitter(project, content)
      post.status = 'posted'
      post.postedAt = new Date()
      await post.save()
    }catch(err){
      console.error('Failed to post', err)
      post.status = 'failed'
      await post.save()
      throw err
    }
  }, { connection: redis })

  worker.on('failed', (job, err) => {
    console.error('Job failed', job.id, err.message)
  })

  return worker
}

// Optionally: start workers for all existing projects on server boot
export const startWorkersForAllProjects = async () => {
  const projects = await Project.find({})
  projects.forEach(p => createWorker(p._id.toString()))
}