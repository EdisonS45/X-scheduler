import Template from '../models/template.js'
import Project from '../models/project.js'
import Post from '../models/post.js'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

// @desc    Create a new template
// @route   POST /api/templates
export const createTemplate = async (req, res) => {
  try {
    const { name, twitterApiKey, twitterApiSecret, twitterAccessToken, twitterAccessSecret } = req.body;

    // Check if template with this name already exists for the user
    const existing = await Template.findOne({ userId: req.user.id, name });
    if (existing) {
      return res.status(400).json({ message: 'A template with this name already exists.' });
    }

    const template = await Template.create({
      userId: req.user.id,
      name,
      twitterApiKey,
      twitterApiSecret,
      twitterAccessToken,
      twitterAccessSecret
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ message: 'Error creating template', error: error.message });
  }
};

// @desc    List all templates for a user
// @route   GET /api/templates
export const listTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching templates', error: error.message });
  }
};

// @desc    Delete a template
// @route   DELETE /api/templates/:id
export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    if (template.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await template.deleteOne(); // Use deleteOne() on the document
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting template', error: error.message });
  }
};

// @desc    Create a new project from a template
// @route   POST /api/templates/:id/create-project
export const createProjectFromTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, timeGapMinutes } = req.body;
    const filePath = req.file.path;

    // 1. Find the template and verify ownership
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    if (template.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // 2. Create the new project
    const project = await Project.create({
      name,
      timeGapMinutes: Number(timeGapMinutes),
      userId: req.user.id,
      status: 'stopped',
      // Copy credentials from template
      twitterApiKey: template.twitterApiKey,
      twitterApiSecret: template.twitterApiSecret,
      twitterAccessToken: template.twitterAccessToken,
      twitterAccessSecret: template.twitterAccessSecret
    });

    const projectDir = path.join("uploads", "projects", project._id.toString());
    fs.mkdirSync(projectDir, { recursive: true });

    // 3. Process the CSV file
    const file = fs.createReadStream(filePath);
    const parsed = await new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: reject,
      });
    });
    
    const posts = parsed.map((r) => ({ projectId: project._id, content: r[0], status: 'pending' }));
    await Post.insertMany(posts);
    
    fs.unlinkSync(filePath); // Clean up uploaded file

    // 4. Return the new project (it is "stopped" and "ready to start")
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Error creating project from template', error: error.message });
  }
};