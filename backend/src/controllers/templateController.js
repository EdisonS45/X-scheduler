import Template from '../models/template.js';

export const createTemplate = async (req, res) => {
  try {
    const template = await Template.create({
      userId: req.user.id,
      name: req.body.name,
      twitterAccountId: req.body.twitterAccountId,
    });
    res.status(201).json(template);
  } catch {
    res.status(400).json({ message: 'Template creation failed' });
  }
};

export const listTemplates = async (req, res) => {
  const templates = await Template.find({ userId: req.user.id });
  res.json(templates);
};

export const deleteTemplate = async (req, res) => {
  await Template.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Template deleted' });
};
