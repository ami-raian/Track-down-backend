const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

const router = Router();

router.post('/register', upload.single('image'), authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.me);

module.exports = router;
