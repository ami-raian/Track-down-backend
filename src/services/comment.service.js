const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const ApiError = require('../utils/ApiError');

/**
 * Add a comment (or a reply, when `parentId` is provided) to a post.
 */
async function addComment(postId, author, { text, parentId }) {
  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound('Post not found');

  if (parentId) {
    const parent = await Comment.findById(parentId);
    if (!parent || parent.post.toString() !== postId.toString()) {
      throw ApiError.badRequest('Invalid parent comment');
    }
  }

  const comment = await Comment.create({
    post: postId,
    author: author._id,
    userName: author.name,
    profileImg: author.image,
    text,
    parent: parentId || null,
  });

  await Post.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } });

  return comment;
}

/**
 * All comments for a post, oldest-first (the frontend builds the reply tree).
 */
async function getComments(postId) {
  return Comment.find({ post: postId }).sort({ createdAt: 1 });
}

/**
 * Delete a comment and all of its nested replies. Only the author (or an admin)
 * may delete. Returns the number of comments removed.
 */
async function deleteComment(commentId, requester) {
  const comment = await Comment.findById(commentId);
  if (!comment) throw ApiError.notFound('Comment not found');

  const isOwner = comment.author.toString() === requester._id.toString();
  if (!isOwner && requester.role !== 'admin') {
    throw ApiError.forbidden('You can only delete your own comments');
  }

  // Collect this comment + all descendant replies (BFS)
  const toDelete = [comment._id];
  let frontier = [comment._id];
  while (frontier.length) {
    const children = await Comment.find({ parent: { $in: frontier } }).select('_id');
    if (!children.length) break;
    const childIds = children.map((c) => c._id);
    toDelete.push(...childIds);
    frontier = childIds;
  }

  await Comment.deleteMany({ _id: { $in: toDelete } });
  await Post.updateOne(
    { _id: comment.post },
    { $inc: { commentsCount: -toDelete.length } }
  );

  return { deleted: toDelete.length };
}

module.exports = { addComment, getComments, deleteComment };
