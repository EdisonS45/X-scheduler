import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/user.js'
import TwitterAccount from '../models/TwitterAccount.js'

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      provider: user.authProvider,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )

const buildAuthResponse = async (user) => {
  const hasConnectedTwitter = await TwitterAccount.exists({
    userId: user._id,
    isActive: true,
  })

  return {
    user: {
      id: user._id,
      email: user.email,
      authProvider: user.authProvider,
      hasConnectedTwitter: !!hasConnectedTwitter,
    },
    token: generateToken(user),
  }
}

/**
 * REGISTER
 */
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters',
      })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({
        message: 'Account already exists',
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await User.create({
      email,
      passwordHash,
      authProvider: 'local',
    })

    const response = await buildAuthResponse(user)

    res.status(201).json(response)
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * LOGIN
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password required',
      })
    }

    const user = await User.findOne({ email }).select('+passwordHash')

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    if (user.authProvider !== 'local') {
      return res.status(400).json({
        message: `Please login using ${user.authProvider}`,
      })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    const response = await buildAuthResponse(user)

    res.json(response)
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}
