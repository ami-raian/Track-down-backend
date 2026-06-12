const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const authService = require('../services/auth.service');
const { fileToUrl } = require('../middlewares/upload.middleware');

// POST /api/auth/register  (multipart/form-data with optional `image`)
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw ApiError.badRequest('name, email and password are required');
  }

  const image = req.file ? fileToUrl(req.file.filename) : '';
  const { user, token } = await authService.register({
    name,
    email,
    password,
    image,
  });

  return sendSuccess(res, 201, 'Registered successfully', { user, token });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw ApiError.badRequest('email and password are required');
  }

  const { user, token } = await authService.login({ email, password });
  return sendSuccess(res, 200, 'Logged in successfully', { user, token });
});

// GET /api/auth/me  (protected)
const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Current user fetched successfully', req.user);
});

module.exports = { register, login, me };
