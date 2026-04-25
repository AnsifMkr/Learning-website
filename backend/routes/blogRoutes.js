const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  deleteBlog,
  toggleLikeBlog,
  addComment,
  deleteComment,
  incrementBlogView
} = require('../controllers/blogController');

const router = express.Router();

/**
 * @route   GET /api/blogs
 * @desc    Public - Get all community blogs
 */
router.get('/', getAllBlogs);

/**
 * @route   GET /api/blogs/:id
 * @desc    Public - Get a specific blog post
 */
router.get('/:id', getBlogById);

/**
 * @route   POST /api/blogs
 * @desc    Protected - Create a new blog post
 */
router.post('/', protect, createBlog);

/**
 * @route   POST /api/blogs/:id/view
 * @desc    Protected - Increment view count (1 per account)
 */
router.post('/:id/view', protect, incrementBlogView);

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Protected - Delete a blog post (author or admin)
 */
router.delete('/:id', protect, deleteBlog);

/**
 * @route   POST /api/blogs/:id/like
 * @desc    Protected - Toggle like for a blog
 */
router.post('/:id/like', protect, toggleLikeBlog);

/**
 * @route   POST /api/blogs/:id/comments
 * @desc    Protected - Add a comment to a blog
 */
router.post('/:id/comments', protect, addComment);

/**
 * @route   DELETE /api/blogs/:id/comments/:commentId
 * @desc    Protected - Delete a comment from a blog
 */
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
