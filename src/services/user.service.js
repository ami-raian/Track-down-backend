const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

async function getAllUsers() {
  return User.find().sort({ createdAt: -1 });
}

async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function updateUser(id, updates) {
  // Disallow changing protected fields through this path
  delete updates.password;
  delete updates.role;
  delete updates.email;

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

module.exports = { getAllUsers, getUserById, updateUser };
