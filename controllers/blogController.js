const Blog = require('../models/Blog');
const User = require('../models/User');

const createBlog = async (req, res) => {
  try {
    const { title, description, body, tags } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const blog = await Blog.create({
      title,
      description,
      body,
      tags: tags || [],
      author: req.user._id
    });

    await blog.populate('author', 'first_name last_name email');

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Blog title must be unique' });
    }
    res.status(500).json({ error: error.message });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { author, title, tags, order_by = 'createdAt', order = 'desc' } = req.query;

    let query = { state: 'published' };
    let searchQuery = {};

    // Search functionality
    if (author) {
      const users = await User.find({
        $or: [
          { first_name: new RegExp(author, 'i') },
          { last_name: new RegExp(author, 'i') }
        ]
      }).select('_id');
      query.author = { $in: users.map(u => u._id) };
    }

    if (title) {
      searchQuery.title = new RegExp(title, 'i');
    }

    if (tags) {
      searchQuery.tags = { $in: tags.split(',').map(tag => new RegExp(tag.trim(), 'i')) };
    }

    query = { ...query, ...searchQuery };

    // Sort options
    const sortOptions = {};
    const validSortFields = ['read_count', 'reading_time', 'createdAt'];
    const sortField = validSortFields.includes(order_by) ? order_by : 'createdAt';
    sortOptions[sortField] = order === 'asc' ? 1 : -1;

    const blogs = await Blog.find(query)
      .populate('author', 'first_name last_name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      _id: req.params.id, 
      state: 'published' 
    }).populate('author', 'first_name last_name email');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Increment read count
    blog.read_count += 1;
    await blog.save();

    res.json({ blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { title, description, body, tags, state } = req.body;
    const blog = req.blog;

    if (title) blog.title = title;
    if (description) blog.description = description;
    if (body) blog.body = body;
    if (tags) blog.tags = tags;
    if (state && ['draft', 'published'].includes(state)) blog.state = state;

    await blog.save();
    await blog.populate('author', 'first_name last_name email');

    res.json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Blog title must be unique' });
    }
    res.status(500).json({ error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { state } = req.query;

    let query = { author: req.user._id };
    if (state && ['draft', 'published'].includes(state)) {
      query.state = state;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getUserBlogs
};