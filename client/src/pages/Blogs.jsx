import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import BlogCard from '../components/BlogCard';
import { useAuth } from '../context/AuthContext';

const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';

const Blogs = () => {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '');
  const [isAdmin, setIsAdmin] = useState(false);

  const computedRole = isAdmin ? 'admin' : user?.role;
  const canCreate = computedRole === 'alumni' || computedRole === 'admin';

  useEffect(() => {
    axios.get(`${apiHost}/api/admin/protected`, { withCredentials: true })
      .then((res) => setIsAdmin(!!res.data.access))
      .catch(() => setIsAdmin(false));
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (activeTag) params.tag = activeTag;
      const res = await axios.get(`${apiHost}/api/blogs`, { params });
      setBlogs(res.data.blogs || []);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get(`${apiHost}/api/blogs/tags`);
      setTags(res.data.tags || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [activeTag]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs();
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (activeTag) params.tag = activeTag;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setActiveTag('');
    setSearchParams({});
    setTimeout(fetchBlogs, 0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-blog">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 mt-[9rem] max-w-980:mt-[100px] w-full flex-grow flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-[#1c2b4a] pl-5">
          <div>
            <h1 className="text-3xl blog-title text-[#1c2b4a]">Alumni Insights</h1>
            <p className="text-gray-500 text-sm mt-1 max-w-xl">
              Professional experiences, career advice, and stories from the IIIT Kota alumni community.
            </p>
          </div>
          {canCreate && (
            <Link
              to="/blogs/create"
              className="inline-flex items-center justify-center h-11 px-5 bg-[#1c2b4a] text-white text-sm font-medium rounded-lg hover:bg-[#121c31] transition-colors"
            >
              Write an article
            </Link>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tags, or author..."
              className="flex-1 h-11 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c2b4a]"
            />
            <button
              type="submit"
              className="h-11 px-5 bg-[#1c2b4a] text-white text-sm font-medium rounded-lg hover:bg-[#121c31] transition-colors"
            >
              Search
            </button>
          </form>
          {(search || activeTag) && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-11 px-4 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTag('')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                !activeTag
                  ? 'bg-[#1c2b4a] text-white border-[#1c2b4a]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  activeTag === tag
                    ? 'bg-[#1c2b4a] text-white border-[#1c2b4a]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-gray-200 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
            No articles found. Check back soon for alumni insights.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((blog, idx) => (
              <BlogCard key={blog._id} blog={blog} index={idx} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Blogs;
