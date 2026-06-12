const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const commentService = require('../services/comment.service');

// POST /api/posts/:id/comments  (protected) — body: { text, parentId? }
const addComment = asyncHandler(async (req, res) => {
  const { text, parentId } = req.body;
  if (!text || !text.trim()) throw ApiError.badRequest('Comment text is required');

  const comment = await commentService.addComment(req.params.id, req.user, {
    text,
    parentId,
  });
  return sendSuccess(res, 201, 'Comment added', comment);
});

// GET /api/posts/:id/comments — flat list (frontend builds the reply tree)
const getComments = asyncHandler(async (req, res) => {
  const comments = await commentService.getComments(req.params.id);
  return sendSuccess(res, 200, 'Comments fetched', comments);
});

// DELETE /api/comments/:id  (protected) — author/admin only
const deleteComment = asyncHandler(async (req, res) => {
  const result = await commentService.deleteComment(req.params.id, req.user);
  return sendSuccess(res, 200, 'Comment deleted', result);
});

module.exports = { addComment, getComments, deleteComment };
