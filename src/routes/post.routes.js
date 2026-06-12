const { Router } = require('express');
const postController = require('../controllers/post.controller');
const { protect } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

const router = Router();

router.get('/', postController.getPosts);
router.get('/me/list', protect, postController.getMyPosts);
router.get('/:id', postController.getPostById);
router.post('/', protect, upload.single('image'), postController.createPost);
router.delete('/:id', protect, postController.deletePost);

module.exports = router;
