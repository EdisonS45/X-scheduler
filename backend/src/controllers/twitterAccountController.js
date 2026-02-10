import TwitterAccount from '../models/twitterAccount.js';

export const listTwitterAccounts = async (req, res) => {
  const accounts = await TwitterAccount.find({ userId: req.user.id });
  res.json(accounts);
};
