import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import projectRoutes from './routes/projectRoutes.js'
import { connectDB } from './config/db.js'
import { redis } from './config/redis.js'
import { startWorkersForAllProjects } from './jobs/worker.js'

dotenv.config()
const app = express()
app.use(cors()); 
app.use(express.json())

app.use('/api/projects', projectRoutes)

const PORT = process.env.PORT || 4000

connectDB().then(()=>{
  // start workers for existing projects
  startWorkersForAllProjects().catch(console.error)

  app.listen(PORT, ()=>console.log('Server listening on', PORT))
})