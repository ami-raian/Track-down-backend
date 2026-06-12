const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/ApiResponse');
const userService = require('../services/user.service');
const { fileToUrl } = require('../middlewares/upload.middleware');
const { getPagination, buildFilter } = require('../utils/query');

const USER_FILTER_FIELDS = ['name', 'email', 'role', 'createdAt'];

// GET /api/users?page=1&length=10&filters={...}  (admin) — paginated + filterable
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = getPagination(req.query);
  const filter = buildFilter(req.query, USER_FILTER_FIELDS);

  const { items, pagination } = await userService.getUsers({
    page,
    pageSize,
    skip,
    filter,
  });
  return sendPaginated(res, 200, 'Users fetched successfully', items, pagination);
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

// DELETE /api/users/:id?hard=true  (admin only) — soft (default) or hard delete
const deleteUser = asyncHandler(async (req, res) => {
  const hard = req.query.hard === 'true';
  const result = await userService.deleteUser(req.params.id, req.user, { hard });
  return sendSuccess(
    res,
    200,
    hard ? 'User permanently deleted' : 'User removed',
    result
  );
});

module.exports = { getAllUsers, getUserById, updateMe, deleteUser };
