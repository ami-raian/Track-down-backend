const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    // Author info (denormalized for fast feed rendering)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    profileImg: { type: String, default: '' },

    // Post content
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    image: {
      type: String, // absolute URL to the post image stored on the VPS
      required: [true, 'Post image is required'],
    },

    // Engagement
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // one entry per user
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Newest-first feed queries
postSchema.index({ createdAt: -1 });

postSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Post', postSchema);
