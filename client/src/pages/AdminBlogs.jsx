import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/iiitkotalogo.png';

axios.defaults.withCredentials = true;

const APIHOST = import.meta.env.VITE_API_URL || 'http://localhost:7034';

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-semibold rounded-[22px] transition-all duration-200
        ${isActive
          ? 'bg-[#FF6600] text-white'
          : 'bg-gray-200 text-gray-800 hover:bg-[#FF6600] hover:text-white'
        }`}
    >
      {label}
    </button>
  );
}

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export function BlogAdminList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [applied, setApplied] = useState({ search: '', author: '', tag: '', sortBy: 'latest' });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await axios.get(`${APIHOST}/api/admin/blogs`, {
        params: {
          page,
          limit: itemsPerPage,
          search: applied.search || undefined,
          author: applied.author || undefined,
          tag: applied.tag || undefined,
          sortBy: applied.sortBy || 'latest'
        }
      });
      setBlogs(res.data.blogs || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      setFetchError(
        err.response?.data?.message ||
        'Failed to load blogs. Restart the backend if you recently added this feature.'
      );
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get(`${APIHOST}/api/admin/blogs/tags`);
      setAllTags(res.data.tags || []);
    } catch {
      setAllTags([]);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [page, itemsPerPage, applied]);

  const handleSearch = () => {
    setApplied({ search: search.trim(), author: authorFilter.trim(), tag: tagFilter, sortBy });
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setAuthorFilter('');
    setTagFilter('');
    setSortBy('latest');
    setApplied({ search: '', author: '', tag: '', sortBy: 'latest' });
    setPage(1);
  };

  const handleDelete = async (blogId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${APIHOST}/api/admin/blogs/${blogId}`);
      setBlogs((prev) => prev.filter((b) => b._id !== blogId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete blog.');
    }
  };

  return (
    <div className="font-blog pb-10">
      <div className="flex flex-wrap gap-2 px-4 mt-6 mb-3 items-center text-sm">
        <input
          placeholder="Search title, tags..."
          className="border p-1 rounded min-w-[140px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <input
          placeholder="Author name"
          className="border p-1 rounded min-w-[120px]"
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <select
          className="border p-1 rounded"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          className="border p-1 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="mostViewed">Most viewed</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-3 py-1 bg-blue-600 text-white rounded-full hover:opacity-80"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1 text-black rounded-full bg-gray-200 hover:opacity-80"
        >
          Reset
        </button>
        <button
          onClick={() => navigate('/admin/blogs/create')}
          className="ml-auto px-4 py-1.5 bg-[#FF6600] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          + New blog
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-4 text-sm mb-4">
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page >= totalPages}
        >
          Next
        </button>
        <label className="flex items-center gap-2">
          Rows:
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border p-1 rounded"
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <Link to="/blogs" target="_blank" className="text-blue-600 hover:underline ml-auto text-xs">
          View public blogs →
        </Link>
      </div>

      {fetchError && (
        <p className="px-4 text-red-600 text-sm mb-4">{fetchError}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#1c2b4a] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <p className="px-4 text-gray-500 text-sm">No blogs found.</p>
      ) : (
        <div className="px-4 space-y-3">
          {blogs.map((blog) => (
            <article
              key={blog._id}
              className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
            >
              <div className="shrink-0 w-24 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                {blog.coverImage ? (
                  <img src={blog.coverImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No cover</div>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex flex-wrap items-start gap-2 justify-between">
                  <h2 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 pr-2">
                    {blog.title}
                  </h2>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/admin/blogs/edit/${blog._id}`)}
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full hover:opacity-90"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id, blog.title)}
                      className="text-xs px-3 py-1 bg-red-500 text-white rounded-full hover:opacity-90"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  {blog.authorProfilePicture ? (
                    <img src={blog.authorProfilePicture} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center">
                      {blog.authorName?.[0]}
                    </span>
                  )}
                  <span className="font-medium text-gray-800">{blog.authorName}</span>
                  {blog.authorCurrentCompany && (
                    <span className="text-gray-500">· {blog.authorCurrentCompany}</span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                  {blog.preview}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {(blog.tags || []).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-gray-500">
                  <span>{formatDate(blog.createdAt)}</span>
                  <span>{blog.views ?? 0} views</span>
                  <span>
                    Posted by:{' '}
                    <span className={blog.postedBy?.type === 'admin' ? 'text-amber-700 font-medium' : 'text-gray-700'}>
                      {blog.postedBy?.type === 'admin' ? 'Admin' : 'Alumni'}
                    </span>
                  </span>
                  {blog.featured && (
                    <span className="text-[#FF6600] font-medium">Featured</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminBlogsPage() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(false);
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${APIHOST}/api/admin/protected`);
      setAuth(res.data.access);
    } catch {
      setAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${APIHOST}/api/admin/login`, { key });
      if (res.data.success) await checkAuth();
      else alert(res.data.message);
    } catch {
      alert('Login Failed');
    }
  };

  const handleLogout = async () => {
    await axios.post(`${APIHOST}/api/admin/logout`);
    setAuth(false);
    setKey('');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) return <div className="p-4 font-blog">Loading...</div>;

  if (!auth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-4 font-blog">
        <img src={Logo} alt="iiit kota logo" className="h-[60px]" />
        <h1 className="text-2xl font-semibold">Admin Key Required</h1>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="border px-4 py-2 rounded w-64"
          placeholder="Enter Admin Key"
        />
        <button onClick={handleLogin} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
          Submit
        </button>
        <Link to="/admin" className="mt-10 underline">Back to Admin Panel</Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 min-h-screen font-blog">
      <div className="p-3 px-4 bg-white flex items-center gap-5">
        <img src={Logo} alt="iiit kota logo" className="h-[60px]" />
        <h1 className="text-2xl font-medium">Blog Management — IIIT Kota Alumni Portal</h1>
      </div>

      <div className="flex bg-white border-t-2 flex-wrap gap-1 gap-y-4 p-4">
        <TabButton label="Alumni" isActive={false} onClick={() => navigate('/admin')} />
        <TabButton label="Students" isActive={false} onClick={() => navigate('/admin/students')} />
        <TabButton label="Blogs" isActive={true} onClick={() => {}} />
        <TabButton label="News" isActive={false} onClick={() => navigate('/admin')} />
        <TabButton label="Events" isActive={false} onClick={() => navigate('/admin')} />
        <div className="ml-auto flex gap-2 items-center mr-3">
          <button
            className="flex items-center bg-red-500 text-white hover:opacity-80 px-4 py-2 font-semibold rounded-[22px]"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>

      <BlogAdminList />
    </div>
  );
}
