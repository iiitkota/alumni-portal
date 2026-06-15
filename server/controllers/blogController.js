const Blog = require('../models/Blog');
const Alumni = require('../models/User');
const {
  buildAuthorSnapshot,
  parseTags,
  uploadCoverImage,
  destroyCoverImage,
  buildBlogListFilter,
  getSortOption,
  attachPreview
} = require('../utils/blogHelpers');

exports.getBlogs = async (req, res) => {
  try {
    const { search, tag, page = 1, limit = 12 } = req.query;
    const filter = buildBlogListFilter({ search, tag });

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort(getSortOption('latest'))
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments(filter)
    ]);

    return res.status(200).json({
      blogs: blogs.map(attachPreview),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getBlogTags = async (req, res) => {
  try {
    const tags = await Blog.distinct('tags');
    return res.status(200).json({ tags: tags.filter(Boolean).sort() });
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const trackView = req.query.trackView !== 'false';
    const blog = trackView
      ? await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      : await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    return res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.createBlog = async (req, res) => {
  const { title, content, tags, authorId, featured } = req.body;

  try {
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    let targetAuthorId;
    let postedBy;

    if (req.isAdmin) {
      if (!authorId) {
        return res.status(400).json({ message: 'authorId is required when posting as admin.' });
      }
      targetAuthorId = authorId;
      postedBy = { type: 'admin' };
    } else {
      targetAuthorId = req.user._id;
      postedBy = { type: 'alumni', userId: req.user._id };
    }

    const author = await Alumni.findById(targetAuthorId);
    if (!author) {
      return res.status(404).json({ message: 'Author alumni not found.' });
    }

    let coverImage;
    let coverImagePublicId;
    if (req.file) {
      const uploadResult = await uploadCoverImage(req.file);
      coverImage = uploadResult.secure_url;
      coverImagePublicId = uploadResult.public_id;
    }

    const blog = new Blog({
      title: title.trim(),
      content: content.trim(),
      tags: parseTags(tags),
      coverImage,
      coverImagePublicId,
      featured: featured === 'true' || featured === true,
      ...buildAuthorSnapshot(author),
      postedBy
    });

    await blog.save();
    return res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBlog = async (req, res) => {
  const { title, content, tags, removeCover, featured } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const isOwner = req.user && blog.authorId.toString() === req.user._id.toString();
    if (!req.isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You can only edit your own blogs.' });
    }

    if (title?.trim()) blog.title = title.trim();
    if (content?.trim()) blog.content = content.trim();
    if (tags !== undefined) blog.tags = parseTags(tags);
    if (featured !== undefined && req.isAdmin) {
      blog.featured = featured === 'true' || featured === true;
    }

    if (removeCover === 'true' || removeCover === true) {
      await destroyCoverImage(blog.coverImagePublicId);
      blog.coverImage = undefined;
      blog.coverImagePublicId = undefined;
    }

    if (req.file) {
      await destroyCoverImage(blog.coverImagePublicId);
      const uploadResult = await uploadCoverImage(req.file);
      blog.coverImage = uploadResult.secure_url;
      blog.coverImagePublicId = uploadResult.public_id;
    }

    await blog.save();
    return res.status(200).json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const isOwner = req.user && blog.authorId.toString() === req.user._id.toString();
    if (!req.isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You can only delete your own blogs.' });
    }

    await destroyCoverImage(blog.coverImagePublicId);
    await blog.deleteOne();

    return res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ authorId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-content');
    return res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching my blogs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
