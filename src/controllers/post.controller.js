const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const postService = require('../services/post.service');
const { fileToUrl } = require('../middlewares/upload.middleware');
const { getPagination, buildFilter } = require('../utils/query');

const POST_FILTER_FIELDS = ['userName', 'userEmail', 'description', 'createdAt'];

// POST /api/posts  (protected, multipart/form-data with `image`)
const createPost = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('A post image is required');

  const post = await postService.createPost(req.user, {
    description: req.body.description,
    image: fileToUrl(req.file.filename),
  });

  return sendSuccess(res, 201, 'Post created', post);
});

// GET /api/posts?page=1&length=10&filters={...}
const getPosts = asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = getPagination(req.query);
  const filter = buildFilter(req.query, POST_FILTER_FIELDS);

  const { items, pagination } = await postService.getPosts({
    page,
    pageSize,
    skip,
    filter,
  });
  return sendPaginated(res, 200, 'Posts fetched successfully', items, pagination);
});

// GET /api/posts/me/list?page=1&length=10  (protected) — the user's own posts
const getMyPosts = asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = getPagination(req.query);
  const { items, pagination } = await postService.getUserPosts(req.user._id, {
    page,
    pageSize,
    skip,
  });
  return sendPaginated(res, 200, 'Your posts fetched successfully', items, pagination);
});

// GET /api/posts/:id
const getPostById = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  return sendSuccess(res, 200, 'Post fetched successfully', post);
});

// POST /api/posts/:id/like  (protected) — toggle like for the current user
const toggleLike = asyncHandler(async (req, res) => {
  const result = await postService.toggleLike(req.params.id, req.user._id);
  return sendSuccess(res, 200, 'Like updated', result);
});

// DELETE /api/posts/:id?hard=true  (protected; hard delete is admin-only)
const deletePost = asyncHandler(async (req, res) => {
  const hard = req.query.hard === 'true';
  const result = await postService.deletePost(req.params.id, req.user, { hard });
  return sendSuccess(
    res,
    200,
    hard ? 'Post permanently deleted' : 'Post deleted',
    result
  );
});

module.exports = {
  createPost,
  getPosts,
  getMyPosts,
  getPostById,
  toggleLike,
  deletePost,
};
