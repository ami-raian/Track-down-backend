const Post = require('../models/post.model');
const ApiError = require('../utils/ApiError');

/**
 * Create a post authored by the given user.
 */
async function createPost(author, { description, image }) {
  return Post.create({
    author: author._id,
    userName: author.name,
    userEmail: author.email,
    profileImg: author.image,
    description,
    image,
  });
}

/**
 * Paginated, newest-first feed.
 */
async function getPosts({ page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments(),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getPostById(id) {
  const post = await Post.findById(id);
  if (!post) throw ApiError.notFound('Post not found');
  return post;
}

/**
 * Delete a post — only the author (or an admin) may do so.
 */
async function deletePost(id, requester) {
  const post = await Post.findById(id);
  if (!post) throw ApiError.notFound('Post not found');

  const isOwner = post.author.toString() === requester._id.toString();
  if (!isOwner && requester.role !== 'admin') {
    throw ApiError.forbidden('You can only delete your own posts');
  }

  await post.deleteOne();
  return post;
}

module.exports = { createPost, getPosts, getPostById, deletePost };
