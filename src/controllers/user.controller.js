const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const userService = require('../services/user.service');
const { fileToUrl } = require('../middlewares/upload.middleware');

// GET /api/users  (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  return sendSuccess(res, 200, 'Users fetched successfully', users);
});

// GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, 200, 'User fetched successfully', user);
});

// PATCH /api/users/me  (protected, optional `image` upload)
const updateMe = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (req.file) updates.image = fileToUrl(req.file.filename);

  const user = await userService.updateUser(req.user._id, updates);
  return sendSuccess(res, 200, 'Profile updated successfully', user);
});

module.exports = { getAllUsers, getUserById, updateMe };
