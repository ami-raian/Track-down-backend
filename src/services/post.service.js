const Post = require('../models/post.model');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/query');

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
 * Paginated, newest-first feed with optional filtering.
 * Returns { items, pagination } in the standard list shape.
 */
async function getPosts({ page = 1, pageSize = 10, skip = 0, filter = {} } = {}) {
  const [items, totalItems] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Post.countDocuments(filter),
  ]);

  return { items, pagination: buildPagination(totalItems, page, pageSize) };
}

async function getPostById(id) {
  const post = await Post.findById(id);
  if (!post) throw ApiError.notFound('Post not found');
  return post;
}

/**
 * Posts authored by a given user, newest first (paginated, standard shape).
 */
async function getUserPosts(authorId, { page = 1, pageSize = 10, skip = 0 } = {}) {
  const filter = { author: authorId };
  const [items, totalItems] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Post.countDocuments(filter),
  ]);
  return { items, pagination: buildPagination(totalItems, page, pageSize) };
}

/**
 * Toggle the current user's like on a post (Facebook-style: one like per user).
 * Returns the new like state and count.
 */
async function toggleLike(postId, userId) {
  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound('Post not found');

  const idx = post.likes.findIndex((id) => id.toString() === userId.toString());
  let liked;
  if (idx === -1) {
    post.likes.push(userId);
    liked = true;
  } else {
    post.likes.splice(idx, 1);
    liked = false;
  }
  await post.save();

  return { liked, likesCount: post.likes.length };
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

module.exports = {
  createPost,
  getPosts,
  getPostById,
  getUserPosts,
  toggleLike,
  deletePost,
};
