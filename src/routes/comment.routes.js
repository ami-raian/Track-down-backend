const { Router } = require('express');
const commentController = require('../controllers/comment.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

router.delete('/:id', protect, commentController.deleteComment);

module.exports = router;
