const User = require('../models/user.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/query');
const { deleteUploadByUrl } = require('../middlewares/upload.middleware');

/**
 * Paginated, filterable user list for the admin panel.
 */
async function getUsers({ page = 1, pageSize = 10, skip = 0, filter = {} } = {}) {
  const [items, totalItems] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    User.countDocuments(filter),
  ]);
  return { items, pagination: buildPagination(totalItems, page, pageSize) };
}

async function getUserById(id) {
  const user = await User.findById(id);
  if (!user || user.isDeleted) throw ApiError.notFound('User not found');
  return user;
}

async function updateUser(id, updates) {
  // Disallow changing protected fields through this path
  delete updates.password;
  delete updates.role;
  delete updates.email;
  delete updates.isDeleted;

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

/**
 * Remove a user — admin only (enforced at the route).
 *  - Default soft delete: the user is deactivated and their posts are hidden;
 *    everything stays in the database.
 *  - `hard: true`: permanently deletes the user, their posts, and every
 *    associated image file on the VPS disk.
 * Admin accounts are protected and an admin cannot remove their own account.
 */
async function deleteUser(id, requester, { hard = false } = {}) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  if (user._id.toString() === requester._id.toString()) {
    throw ApiError.forbidden('You cannot remove your own account');
  }
  if (user.role === 'admin') {
    throw ApiError.forbidden('Admin accounts cannot be removed');
  }

  if (hard) {
    // Delete every image file owned by the user from the VPS
    deleteUploadByUrl(user.image);
    const posts = await Post.find({ author: user._id }).select('image');
    posts.forEach((p) => deleteUploadByUrl(p.image));
    const postIds = posts.map((p) => p._id);

    // Purge their posts, comments on those posts, and their own comments
    await Comment.deleteMany({
      $or: [{ post: { $in: postIds } }, { author: user._id }],
    });
    await Post.deleteMany({ author: user._id });
    await user.deleteOne();
    return { hard: true, postsRemoved: posts.length };
  }

  // Soft delete — deactivate the user and hide their posts
  const now = new Date();
  user.isDeleted = true;
  user.deletedAt = now;
  await user.save();
  const res = await Post.updateMany(
    { author: user._id, isDeleted: { $ne: true } },
    { isDeleted: true, deletedAt: now }
  );
  return { hard: false, postsHidden: res.modifiedCount };
}

module.exports = { getUsers, getUserById, updateUser, deleteUser };
