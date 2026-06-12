const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { signAccessToken } = require('../utils/token');

/**
 * Register a new user with email + password.
 */
async function register({ name, email, password, image }) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already in use');

  const user = await User.create({ name, email, password, image });
  const token = signAccessToken({ sub: user._id, role: user.role });

  return { user, token };
}

/**
 * Authenticate with email + password.
 */
async function login({ email, password }) {
  // password is select:false, so explicitly include it
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (user.isDeleted)
    throw ApiError.unauthorized('This account has been deactivated');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  const token = signAccessToken({ sub: user._id, role: user.role });
  user.password = undefined;

  return { user, token };
}

module.exports = { register, login };
