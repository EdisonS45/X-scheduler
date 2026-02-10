import TwitterAccount from '../models/TwitterAccount.js';
import Project from '../models/project.js';

export const listTwitterAccounts = async (req, res) => {
  const accounts = await TwitterAccount.find(
    { userId: req.user.id },
    { accessToken: 0, refreshToken: 0 }
  ).sort('-createdAt');

  res.json(accounts);
};

export const activateTwitterAccount = async (req, res) => {
  const account = await TwitterAccount.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!account) {
    return res.status(404).json({ message: 'Twitter account not found' });
  }

  account.isActive = true;
  account.revokedAt = null;
  await account.save();

  res.json({ message: 'Twitter account activated' });
};

export const deactivateTwitterAccount = async (req, res) => {
  const account = await TwitterAccount.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!account) {
    return res.status(404).json({ message: 'Twitter account not found' });
  }

  const runningProject = await Project.findOne({
    twitterAccountId: account._id,
    status: 'running',
  });

  if (runningProject) {
    return res.status(400).json({
      message: 'Cannot deactivate account used by a running project',
    });
  }

  account.isActive = false;
  account.revokedAt = new Date();
  await account.save();

  res.json({ message: 'Twitter account deactivated' });
};

export const deleteTwitterAccount = async (req, res) => {
  const account = await TwitterAccount.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!account) {
    return res.status(404).json({ message: 'Twitter account not found' });
  }

  const linkedProject = await Project.findOne({
    twitterAccountId: account._id,
  });

  if (linkedProject) {
    return res.status(400).json({
      message: 'Cannot delete account linked to a project',
    });
  }

  await account.deleteOne();
  res.json({ message: 'Twitter account deleted' });
};
