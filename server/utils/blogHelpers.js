const cloudinary = require('../config/cloudinary');

const resolveAuthorRole = (alumni) => {
  if (alumni.role && alumni.role !== 'alumni') return alumni.role;
  return alumni.branch || '';
};

const buildAuthorSnapshot = (alumni) => ({
  authorId: alumni._id,
  authorName: alumni.name,
  authorProfilePicture: alumni.profilePicture || '',
  authorCurrentCompany: alumni.currentCompany || '',
  authorRole: resolveAuthorRole(alumni),
  authorGraduationYear: alumni.graduationYear || ''
});

const parseTags = (tagsInput) => {
  if (!tagsInput) return [];
  if (Array.isArray(tagsInput)) {
    return tagsInput.map((t) => String(t).trim()).filter(Boolean);
  }
  return String(tagsInput)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
};

const uploadCoverImage = async (file) => {
  let uploadSource;
  if (file.buffer) {
    uploadSource = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  } else if (file.path) {
    uploadSource = file.path;
  } else {
    throw new Error('Cover image could not be processed.');
  }

  return cloudinary.uploader.upload(uploadSource, {
    folder: 'iiitk-alumni-blogs',
    resource_type: 'image',
    use_filename: true,
    unique_filename: true
  });
};

const destroyCoverImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.error('Error deleting blog cover from Cloudinary:', err);
  }
};

const buildBlogListFilter = ({ search, tag, author }) => {
  const filter = {};

  if (tag?.trim()) {
    filter.tags = { $regex: new RegExp(`^${tag.trim()}$`, 'i') };
  }

  if (author?.trim()) {
    filter.authorName = { $regex: author.trim(), $options: 'i' };
  }

  if (search?.trim()) {
    const keyword = search.trim();
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { authorName: { $regex: keyword, $options: 'i' } },
      { tags: { $regex: keyword, $options: 'i' } }
    ];
  }

  return filter;
};

const getSortOption = (sortBy) => {
  switch (sortBy) {
    case 'oldest':
      return { createdAt: 1 };
    case 'mostViewed':
      return { views: -1, createdAt: -1 };
    case 'latest':
    default:
      return { createdAt: -1 };
  }
};

const attachPreview = (blog) => {
  const obj = blog.toObject ? blog.toObject() : { ...blog };
  obj.preview = obj.content ? String(obj.content).substring(0, 220) : '';
  delete obj.content;
  return obj;
};

module.exports = {
  resolveAuthorRole,
  buildAuthorSnapshot,
  parseTags,
  uploadCoverImage,
  destroyCoverImage,
  buildBlogListFilter,
  getSortOption,
  attachPreview
};
