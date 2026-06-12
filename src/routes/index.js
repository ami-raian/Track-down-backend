const { Router } = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');
const commentRoutes = require('./comment.routes');

const router = Router();

router.get('/health', (_req, res) =>
  res.json({ success: true, message: 'Track Down API is healthy' })
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);

module.exports = router;
