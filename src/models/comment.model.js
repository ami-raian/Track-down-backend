const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalized author info for fast rendering
    userName: { type: String, required: true, trim: true },
    profileImg: { type: String, default: '' },

    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: 1000,
    },

    // null = top-level comment; otherwise the comment this one replies to
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

commentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Comment', commentSchema);
