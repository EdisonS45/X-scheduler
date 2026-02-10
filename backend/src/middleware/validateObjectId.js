import mongoose from 'mongoose';

export const validateObjectId = (req, res, next) => {
  const id = req.params.id || req.params.projectId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  next();
};
