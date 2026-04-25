const Blog = require('../models/Blog');

// GET /api/blogs
exports.getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name username avatarUrl')
      .sort({ createdAt: -1 })
      .lean();
    res.json(blogs);
  } catch (err) {
    next(err);
  }
};

// GET /api/blogs/:id
exports.getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name username avatarUrl')
      .populate('comments.user', 'name username avatarUrl')
      .lean();
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    next(err);
  }
};

// POST /api/blogs/:id/view  — call once on page mount, not on every read
exports.incrementBlogView = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    if (!blog.viewedBy) {
      blog.viewedBy = [];
    }

    if (!blog.viewedBy.includes(req.user._id)) {
      blog.viewedBy.push(req.user._id);
      blog.views += 1;
      await blog.save();
    }
    
    res.json({ ok: true, views: blog.views });
  } catch (err) {
    next(err);
  }
};

// POST /api/blogs
exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newBlog = new Blog({
      title,
      content,
      tags: tags || [],
      author: req.user._id
    });

    await newBlog.save();
    
    // Populate author before returning
    const populatedBlog = await Blog.findById(newBlog._id).populate('author', 'name username avatarUrl');
    res.status(201).json(populatedBlog);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/blogs/:id
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    // Ensure user requesting deletion is the author or an admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this blog' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/blogs/:id/like
exports.toggleLikeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const userId = req.user._id;
    const index = blog.likes.indexOf(userId);

    if (index === -1) {
      // Like
      blog.likes.push(userId);
    } else {
      // Unlike
      blog.likes.splice(index, 1);
    }
    
    await blog.save();
    res.json({ likes: blog.likes });
  } catch (err) {
    next(err);
  }
};

// POST /api/blogs/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment content is required' });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const newComment = {
      user: req.user._id,
      content,
    };

    blog.comments.push(newComment);
    await blog.save();

    const populatedBlog = await Blog.findById(blog._id).populate('comments.user', 'name username avatarUrl');
    res.status(201).json({ comments: populatedBlog.comments });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/blogs/:id/comments/:commentId
exports.deleteComment = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (
      comment.user.toString() !== req.user._id.toString() &&
      blog.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    blog.comments.pull(req.params.commentId);
    await blog.save();
    
    res.json({ message: 'Comment deleted successfully', comments: blog.comments });
  } catch (err) {
    next(err);
  }
};
