const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

const router = Router();

router.patch('/me', protect, upload.single('image'), userController.updateMe);
router.get('/', protect, restrictTo('admin'), userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Admin only — remove a user (soft by default, ?hard=true to purge)
router.delete('/:id', protect, restrictTo('admin'), userController.deleteUser);

module.exports = router;
