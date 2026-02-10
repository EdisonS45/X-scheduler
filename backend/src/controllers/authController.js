import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

/**
 * REGISTER (LOCAL)
 */
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    email,
    passwordHash, // ✅ CORRECT FIELD
    authProvider: 'local',
  });

  res.status(201).json({
    id: user._id,
    email: user.email,
    token: generateToken(user._id),
  });
};

/**
 * LOGIN (LOCAL)
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  // IMPORTANT: explicitly include passwordHash
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.authProvider !== 'local') {
    return res.status(400).json({
      message: `Use ${user.authProvider} login instead`,
    });
  }

  if (!user.passwordHash) {
    return res.status(500).json({
      message: 'Password not set for this account',
    });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    id: user._id,
    email: user.email,
    token: generateToken(user._id),
  });
};
