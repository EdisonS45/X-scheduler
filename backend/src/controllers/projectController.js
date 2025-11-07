import fs from "fs";
import Papa from "papaparse";
import path from "path";
import Project from "../models/project.js";
import Post from "../models/post.js";
import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

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

export const uploadCsv = async (req, res) => {
  try {
    const projectId = req.params.id;
    await getProjectAndCheckOwnership(projectId, req.user.id); // --- ADDED AUTH ---

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

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectAndCheckOwnership(id, req.user.id); // --- ADDED AUTH ---

    // Get queue and stop worker *before* deleting
    const queue = new Queue(`queue_${id}`, { connection: redis });
    await queue.obliterate({ force: true }); // Remove all jobs, etc.
    await queue.close();
    // Assuming worker is stopped via a separate call or manager
    // For simplicity here, we just wipe the queue.
    // The new schedulerController handles stopping the worker.

    await Project.findByIdAndDelete(id);
    await Post.deleteMany({ projectId: id });
    
    const projectDir = path.join("uploads", "projects", id);
    if (fs.existsSync(projectDir)) fs.rmSync(projectDir, { recursive: true });
    
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting project', error: error.message });
  }
};

export const listProjects = async (req, res) => {
  try {
    // --- ADDED AUTH: Only find projects for this user ---
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // Attach post counts for a richer UI
    const projectsWithCounts = await Promise.all(projects.map(async (p) => {
      const pending = await Post.countDocuments({ projectId: p._id, status: 'pending' });
      const posted = await Post.countDocuments({ projectId: p._id, status: 'posted' });
      const failed = await Post.countDocuments({ projectId: p._id, status: 'failed' });
      return { ...p.toObject(), pending, posted, failed };
    }));

    res.json(projectsWithCounts);
  } catch (error) {
    res.status(400).json({ message: 'Error listing projects', error: error.message });
  }
};

// --- NEW Endpoint ---
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectAndCheckOwnership(id, req.user.id); // --- ADDED AUTH ---
    
    const posts = await Post.find({ projectId: id }).sort({ scheduledAt: 1 });
    
    res.json({ project, posts });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching project details', error: error.message });
  }
};