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

exports.listBlogs = async (req, res) => {
  try {
    const {
      search,
      tag,
      author,
      sortBy = 'latest',
      page = 1,
      limit = 20
    } = req.query;

    const filter = buildBlogListFilter({ search, tag, author });
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort(getSortOption(sortBy))
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
    console.error('Error listing admin blogs:', error);
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

exports.searchAuthors = async (req, res) => {
  try {
    const { q = '', limit = 30 } = req.query;
    const filter = {};
    if (q.trim()) {
      const keyword = q.trim();
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { instituteId: { $regex: keyword, $options: 'i' } },
        { currentCompany: { $regex: keyword, $options: 'i' } }
      ];
    }

    const alumni = await Alumni.find(filter)
      .select('name profilePicture currentCompany instituteId graduationYear branch')
      .sort({ name: 1 })
      .limit(Math.min(50, Math.max(1, parseInt(limit, 10) || 30)));

    return res.status(200).json({ authors: alumni });
  } catch (error) {
    console.error('Error searching blog authors:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    return res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching admin blog:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.createBlog = async (req, res) => {
  const { title, content, tags, authorId, featured } = req.body;

  try {
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }
    if (!authorId) {
      return res.status(400).json({ message: 'Please select an alumni author.' });
    }

    const author = await Alumni.findById(authorId);
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
      postedBy: { type: 'admin' }
    });

    await blog.save();
    return res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating admin blog:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBlog = async (req, res) => {
  const { title, content, tags, authorId, removeCover, featured } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (title?.trim()) blog.title = title.trim();
    if (content?.trim()) blog.content = content.trim();
    if (tags !== undefined) blog.tags = parseTags(tags);
    if (featured !== undefined) {
      blog.featured = featured === 'true' || featured === true;
    }

    if (authorId && authorId !== blog.authorId.toString()) {
      const author = await Alumni.findById(authorId);
      if (!author) {
        return res.status(404).json({ message: 'Author alumni not found.' });
      }
      Object.assign(blog, buildAuthorSnapshot(author));
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
    console.error('Error updating admin blog:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await destroyCoverImage(blog.coverImagePublicId);
    await blog.deleteOne();

    return res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin blog:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
