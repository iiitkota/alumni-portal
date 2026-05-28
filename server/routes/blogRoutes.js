const express = require('express');
const multer = require('multer');
const {
  getBlogs,
  getBlogById,
  getBlogTags,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs
} = require('../controllers/blogController');
const {
  authenticateBlogAuthor,
  authenticateBlogEditor
} = require('../middleware/blogMiddleware');
const { authenticateAlumni } = require('../middleware/roleMiddleware');

const router = express.Router();

const coverUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed for cover images'), false);
  }
});

router.get('/', getBlogs);
router.get('/tags', getBlogTags);
router.get('/mine', authenticateAlumni, getMyBlogs);
router.get('/:id', getBlogById);

router.post('/', authenticateBlogAuthor, coverUpload.single('coverImage'), createBlog);
router.put('/:id', authenticateBlogEditor, coverUpload.single('coverImage'), updateBlog);
router.delete('/:id', authenticateBlogEditor, deleteBlog);

module.exports = router;
