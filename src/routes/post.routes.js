const { Router } = require('express');
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

const router = Router();

router.get('/', postController.getPosts);
router.get('/me/list', protect, postController.getMyPosts);
router.get('/:id', postController.getPostById);
router.post('/', protect, upload.single('image'), postController.createPost);
router.delete('/:id', protect, postController.deletePost);

// Engagement
router.post('/:id/like', protect, postController.toggleLike);
router.get('/:id/comments', commentController.getComments);
router.post('/:id/comments', protect, commentController.addComment);

module.exports = router;
