const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

const router = Router();

router.patch('/me', protect, upload.single('image'), userController.updateMe);
router.get('/', protect, restrictTo('admin'), userController.getAllUsers);
router.get('/:id', userController.getUserById);

module.exports = router;
