import fs from "fs";
import Papa from "papaparse";
import { Queue } from "bullmq";
import { redis } from "../config/redis.js";
import path from "path";
import Project from "../models/project.js";
import Post from "../models/post.js";

const getQueue = (projectId) =>
  new Queue(`queue_${projectId}`, { connection: redis });

export const createProject = async (req, res) => {
  const {
    name,
    twitterApiKey,
    twitterApiSecret,
    twitterAccessToken,
    twitterAccessSecret,
    timeGapMinutes,
  } = req.body;

  // create a new document
  const project = new Project({
    name,
    twitterApiKey,
    twitterApiSecret,
    twitterAccessToken,
    twitterAccessSecret,
    timeGapMinutes,
  });

  // save the instance (not the model)
  await project.save();
  const projectDir = path.join("uploads", "projects", project._id.toString());
  fs.mkdirSync(projectDir, { recursive: true });
  return res.json(project);
};

export const uploadCsv = async (req, res) => {
  const projectId = req.params.id;
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
  // parsed: array of rows, each row is array of columns
  const posts = parsed.map((r) => ({ projectId, content: r[0] }));
  await Post.insertMany(posts);
  const projectDir = path.join("uploads", "projects", projectId);
  fs.mkdirSync(projectDir, { recursive: true });
  const postsPath = path.join(projectDir, "posts.json");
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
  fs.unlinkSync(filePath);
  return res.json({ inserted: posts.length });
};

export const pauseProject = async (req, res) => {
  const { id } = req.params;
  const queue = new Queue(`queue:${id}`, { connection: redis });
  await queue.pause();
  const project = await Project.findById(id);
  project.status = "paused";
  await project.save();
  res.json({ message: "Project paused" });
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;
  await Project.findByIdAndDelete(id);
  await Post.deleteMany({ projectId: id });
  const projectDir = path.join("uploads", "projects", id);
  if (fs.existsSync(projectDir)) fs.rmSync(projectDir, { recursive: true });
  res.json({ message: "Project deleted" });
};

export const listProjects = async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
};
