import fs from "fs";
import Papa from "papaparse";
import path from "path";
import Project from "../models/project.js";
import Post from "../models/post.js";
import { Queue } from 'bullmq';
import { redis } from "../config/redis.js";
import { stopWorker } from "../jobs/workerManager.js"; // Import stopWorker

// --- Helper to check project ownership ---
const getProjectAndCheckOwnership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  if (project.userId.toString() !== userId.toString()) {
    throw new Error('User not authorized for this project');
  }
  return project;
};

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const {
      name,
      twitterApiKey,
      twitterApiSecret,
      twitterAccessToken,
      twitterAccessSecret,
      timeGapMinutes,
    } = req.body;

    const project = new Project({
      name,
      twitterApiKey,
      twitterApiSecret,
      twitterAccessToken,
      twitterAccessSecret,
      timeGapMinutes,
      userId: req.user.id, // --- ADDED AUTH ---
      status: 'stopped', // Default to 'stopped'
    });

    await project.save();
    const projectDir = path.join("uploads", "projects", project._id.toString());
    fs.mkdirSync(projectDir, { recursive: true });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Error creating project', error: error.message });
  }
};

// @desc    Upload CSV to a project
// @route   POST /api/projects/:id/upload-csv
export const uploadCsv = async (req, res) => {
  try {
    const projectId = req.params.id;
    await getProjectAndCheckOwnership(projectId, req.user.id);

    const filePath = req.file.path;
    const file = fs.createReadStream(filePath);
    const parsed = await new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: reject,
      });
    });
    
    const posts = parsed.map((r) => ({ projectId, content: r[0], status: 'pending' }));
    await Post.insertMany(posts);
    
    // Storing JSON is redundant but kept from original logic
    const projectDir = path.join("uploads", "projects", projectId);
    fs.mkdirSync(projectDir, { recursive: true });
    const postsPath = path.join(projectDir, "posts.json");
    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
    
    fs.unlinkSync(filePath); // Clean up uploaded file
    return res.json({ inserted: posts.length });
  } catch (error) {
    res.status(400).json({ message: 'Error uploading CSV', error: error.message });
  }
};

// --- NEW Helper function for deleting a project's assets ---
const deleteProjectAssets = async (projectId) => {
  try {
    // Stop worker if it's running
    await stopWorker(projectId.toString());
  } catch (err) {
    // Log warning but continue deletion
    console.warn(`Could not stop worker for ${projectId}: ${err.message}`);
  }

  // Obliterate queue
  const queue = new Queue(`queue_${projectId}`, { connection: redis });
  await queue.obliterate({ force: true });
  await queue.close();
  
  // Delete all posts
  await Post.deleteMany({ projectId });
  
  // Delete project-specific uploads directory
  const projectDir = path.join("uploads", "projects", projectId.toString());
  if (fs.existsSync(projectDir)) fs.rmSync(projectDir, { recursive: true });
};
// ---

// @desc    Delete a single project
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await getProjectAndCheckOwnership(id, req.user.id);

    // Use the new helper
    await deleteProjectAssets(id);
    
    // Delete the project itself
    await Project.findByIdAndDelete(id);
    
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting project', error: error.message });
  }
};

// --- NEW Bulk Delete Function ---
// @desc    Delete multiple projects
// @route   POST /api/projects/delete-bulk
export const deleteBulkProjects = async (req, res) => {
  try {
    const { projectIds } = req.body;
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ message: 'projectIds must be a non-empty array.' });
    }

    let deletedCount = 0;
    const errors = [];

    // Loop and delete one by one to ensure ownership and proper asset cleanup
    for (const id of projectIds) {
      try {
        const project = await Project.findById(id);
        if (!project) {
          errors.push(`Project ${id} not found.`);
          continue;
        }
        // Check ownership
        if (project.userId.toString() !== req.user.id) {
          errors.push(`Not authorized to delete project ${id}.`);
          continue;
        }
        
        // Use the helper to clean up assets
        await deleteProjectAssets(id);
        
        // Delete the project itself
        await Project.findByIdAndDelete(id);
        deletedCount++;
      } catch (err) {
        errors.push(`Failed to delete project ${id}: ${err.message}`);
      }
    }

    res.json({ 
      message: `Successfully deleted ${deletedCount} projects.`,
      errors
    });
  } catch (error) {
    res.status(400).json({ message: 'Error during bulk delete', error: error.message });
  }
};
// ---

// --- HEAVILY UPDATED listProjects ---
// @desc    List and categorize all projects for the dashboard
// @route   GET /api/projects
export const listProjects = async (req, res) => {
  try {
    // Only find projects for this user
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // Attach post counts for a richer UI
    const projectsWithCounts = await Promise.all(projects.map(async (p) => {
      const pending = await Post.countDocuments({ projectId: p._id, status: 'pending' });
      const posted = await Post.countDocuments({ projectId: p._id, status: 'posted' });
      const failed = await Post.countDocuments({ projectId: p._id, status: 'failed' });
      return { ...p.toObject(), pending, posted, failed };
    }));

    // --- New Categorization Logic ---
    const active = []; // Running or Paused
    const pendingStopped = []; // Stopped but has pending posts
    const completed = []; // Stopped and has NO pending posts

    for (const p of projectsWithCounts) {
      if (p.status === 'running' || p.status === 'paused') {
        active.push(p);
      } else if (p.status === 'stopped' && p.pending > 0) {
        pendingStopped.push(p);
      } else if (p.status === 'stopped' && p.pending === 0) {
        completed.push(p);
      }
    }
    // ---

    res.json({ active, pendingStopped, completed });

  } catch (error) {
    res.status(400).json({ message: 'Error listing projects', error: error.message });
  }
};
// ---

// @desc    Get a single project by ID (for details page)
// @route   GET /api/projects/:id
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectAndCheckOwnership(id, req.user.id);
    
    const posts = await Post.find({ projectId: id }).sort({ scheduledAt: 1 });
    
    res.json({ project, posts });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching project details', error: error.message });
  }
};