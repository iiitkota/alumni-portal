import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import Avatar from '../assets/avatar.png';
import { useAuth } from '../context/AuthContext';

const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    axios.get(`${apiHost}/api/admin/protected`, { withCredentials: true })
      .then((res) => setIsAdmin(!!res.data.access))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiHost}/api/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id]);

  const computedRole = isAdmin ? 'admin' : user?.role;
  const isOwner = user?.id && blog?.authorId && String(blog.authorId) === String(user.id);
  const canEdit = isAdmin || (computedRole === 'alumni' && isOwner);

  const handleDelete = async () => {
    if (!window.confirm('Delete this article permanently?')) return;
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      await axios.delete(`${apiHost}/api/blogs/${id}`, {
        headers,
        withCredentials: true
      });
      navigate('/blogs');
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert(err.response?.data?.message || 'Failed to delete article.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center mt-32">
          <div className="w-8 h-8 border-2 border-[#1c2b4a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <p className="text-gray-500 mb-4">Article not found.</p>
          <Link to="/blogs" className="text-[#1c2b4a] font-semibold hover:underline">Back to insights</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-blog">
      <Navbar />

      <article className="max-w-3xl mx-auto px-4 py-8 mt-[9rem] max-w-980:mt-[100px] w-full flex-grow animate-[fadeIn_0.4s_ease-out]">
        <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

        <Link to="/blogs" className="text-sm text-gray-500 hover:text-[#1c2b4a] transition-colors mb-6 inline-block">
          ← Back to insights
        </Link>

        {blog.coverImage && (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full max-h-[420px] object-cover rounded-2xl border border-gray-200 mb-8"
          />
        )}

        <div className="flex items-start gap-4 mb-6">
          <img
            src={blog.authorProfilePicture || Avatar}
            alt={blog.authorName}
            className="w-14 h-14 rounded-full object-cover border border-gray-200"
          />
          <div>
            <p className="font-bold text-gray-900">{blog.authorName}</p>
            <p className="text-sm blog-meta">
              {[blog.authorCurrentCompany, blog.authorRole].filter(Boolean).join(' · ')}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {blog.authorGraduationYear && `Class of ${blog.authorGraduationYear} · `}
              {formatDate(blog.createdAt)}
              {blog.views > 0 && ` · ${blog.views} views`}
            </p>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl blog-title text-[#1c2b4a] leading-tight mb-4">{blog.title}</h1>

        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-gray max-w-none">
          <div className="blog-prose text-gray-800 text-base whitespace-pre-wrap">{blog.content}</div>
        </div>

        {canEdit && (
          <div className="flex gap-3 mt-10 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/blogs/edit/${blog._id}`)}
              className="px-4 py-2 bg-[#1c2b4a] text-white text-sm font-medium rounded-lg hover:bg-[#121c31] transition-colors"
            >
              Edit article
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
};

export default BlogDetail;
