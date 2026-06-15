import { Link } from 'react-router-dom';
import Avatar from '../assets/avatar.png';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getLowQualityImageUrl = (url) => {
  if (!url) return null;
  if (!url.includes('/upload/')) return url;
  const parts = url.split('/upload/');
  return `${parts[0]}/upload/w_800,h_400,c_fill,f_auto,q_auto/${parts[1]}`;
};

const BlogCard = ({ blog, index = 0 }) => {
  const delay = `${Math.min(index * 60, 300)}ms`;

  return (
    <article
      className="font-blog group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-out opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]"
      style={{ animationDelay: delay }}
    >
      {blog.coverImage && (
        <Link to={`/blogs/${blog._id}`} className="block overflow-hidden">
          <img
            src={getLowQualityImageUrl(blog.coverImage)}
            alt={blog.title}
            className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </Link>
      )}

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <img
            src={blog.authorProfilePicture || Avatar}
            alt={blog.authorName}
            className="w-11 h-11 rounded-full object-cover border border-gray-200"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{blog.authorName}</p>
            <p className="text-xs text-gray-500 truncate">
              {[blog.authorCurrentCompany, blog.authorRole].filter(Boolean).join(' · ')}
            </p>
            <p className="text-[10px] text-gray-400">
              {blog.authorGraduationYear && `Class of ${blog.authorGraduationYear} · `}
              {formatDate(blog.createdAt)}
            </p>
          </div>
        </div>

        <Link to={`/blogs/${blog._id}`} className="block">
          <h3 className="text-lg font-bold text-[#1c2b4a] leading-snug group-hover:text-[#121c31] transition-colors">
            {blog.title}
          </h3>
          {blog.preview && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
              {blog.preview}
            </p>
          )}
        </Link>

        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogCard;
