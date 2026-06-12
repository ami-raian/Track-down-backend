const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const postService = require('../services/post.service');
const { fileToUrl } = require('../middlewares/upload.middleware');

// POST /api/posts  (protected, multipart/form-data with `image`)
const createPost = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('A post image is required');

  const post = await postService.createPost(req.user, {
    description: req.body.description,
    image: fileToUrl(req.file.filename),
  });

  return sendSuccess(res, 201, 'Post created', { post });
});

// GET /api/posts?page=1&limit=10
const getPosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const { items, meta } = await postService.getPosts({ page, limit });
  return sendSuccess(res, 200, 'Posts fetched', { posts: items }, meta);
});

// GET /api/posts/:id
const getPostById = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  return sendSuccess(res, 200, 'Post fetched', { post });
});

// DELETE /api/posts/:id  (protected)
const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePost(req.params.id, req.user);
  return sendSuccess(res, 200, 'Post deleted', null);
});

module.exports = { createPost, getPosts, getPostById, deletePost };
