const express = require('express');
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getUserBlogs
} = require('../controllers/blogController');
const { auth, optionalAuth } = require('../middleware/auth');
const checkOwnership = require('../middleware/owner');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllBlogs);
router.get('/:id', optionalAuth, getBlogById);

// Protected routes
router.post('/', auth, createBlog);
router.put('/:id', auth, checkOwnership, updateBlog);
router.delete('/:id', auth, checkOwnership, deleteBlog);

module.exports = router;