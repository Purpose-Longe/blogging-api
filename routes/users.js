const express = require('express');
const { getUserBlogs } = require('../controllers/blogController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/blogs', auth, getUserBlogs);

module.exports = router;