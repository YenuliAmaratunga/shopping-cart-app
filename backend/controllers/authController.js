import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const loginUser = async (req, res) => {
  try {
    const { provider, name, email, password } = req.body;
    
    // Email / Password Login
    if (provider === 'Email' || provider === 'Admin') {
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
      }

      // Hardcoded Admin logic
      if (email === 'admin@gmail.com' && password === 'admin') {
        let admin = await User.findOne({ email });
        if (!admin) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          admin = await User.create({ name: 'Admin User', email, password: hashedPassword, provider: 'Admin', role: 'admin' });
        }
        return res.json({
          user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
          token: generateToken(admin._id)
        });
      }

      const user = await User.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          token: generateToken(user._id)
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // OAuth/Passkey Login (Google, Facebook, Passkey, Guest)
    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
    let user = null;

    if (normalizedEmail) {
      user = await User.findOne({ email: normalizedEmail });
    }

    if (!user && name && provider) {
      user = await User.findOne({ name, provider });
    }

    if (!user) {
      user = await User.create({
        name: name || (normalizedEmail ? normalizedEmail.split('@')[0] : 'User'),
        email: normalizedEmail,
        provider,
        role: 'user'
      });
    } else {
      // Keep identity info in sync for users that already exist.
      user.name = name || user.name;
      if (normalizedEmail && !user.email) {
        user.email = normalizedEmail;
      }
      user.provider = provider || user.provider;
      await user.save();
    }
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        role: user.role
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: 'Email',
      role: 'user'
    });

    if (user) {
      res.status(201).json({
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Keep response generic to avoid exposing whether an account exists.
    if (!user) {
      return res.json({ message: 'If an account exists for this email, reset instructions will be sent.' });
    }

    // MVP behavior: acknowledge request without email service integration.
    return res.json({ message: 'Reset request received. Password reset email service will be integrated next.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Failed to process forgot password request' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found for this email' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.provider = user.provider === 'Email' || user.provider === 'Admin' ? user.provider : 'Email';
    await user.save();

    return res.json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};
