import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/iiitkotalogo.png';

axios.defaults.withCredentials = true;

const APIHOST = import.meta.env.VITE_API_URL || 'http://localhost:7034';

function AuthorSearchSelect({ value, onChange, disabled, initialLabel = '' }) {
  const [query, setQuery] = useState('');
  const [authors, setAuthors] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(initialLabel);
  const wrapRef = useRef(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await axios.get(`${APIHOST}/api/admin/blogs/authors`, {
          params: { q: query, limit: 25 }
        });
        setAuthors(res.data.authors || []);
      } catch {
        setAuthors([]);
      }
    };
    const t = setTimeout(fetchAuthors, 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (initialLabel) setSelectedLabel(initialLabel);
  }, [initialLabel]);

  useEffect(() => {
    if (!value) {
      if (!initialLabel) setSelectedLabel('');
      return;
    }
    const found = authors.find((a) => a._id === value || a._id === value?.toString?.());
    if (found) {
      setSelectedLabel(`${found.name} — ${found.currentCompany || 'N/A'}`);
    }
  }, [value, authors, initialLabel]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alumni author*</label>
      <input
        type="text"
        disabled={disabled}
        placeholder={selectedLabel || 'Search by name, ID, or company...'}
        value={open ? query : selectedLabel || query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange('');
        }}
        onFocus={() => setOpen(true)}
        className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1c2b4a] disabled:bg-gray-100"
      />
      {open && !disabled && (
        <ul className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
          {authors.length === 0 ? (
            <li className="px-3 py-2 text-gray-500">No alumni found</li>
          ) : (
            authors.map((a) => (
              <li key={a._id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    onChange(a._id);
                    setSelectedLabel(`${a.name} — ${a.currentCompany || 'N/A'}`);
                    setQuery('');
                    setOpen(false);
                  }}
                >
                  {a.profilePicture ? (
                    <img src={a.profilePicture} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                      {a.name?.[0]}
                    </span>
                  )}
                  <span>
                    <span className="font-medium">{a.name}</span>
                    <span className="text-gray-500"> — {a.currentCompany || 'N/A'}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default function AdminBlogForm({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auth, setAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [key, setKey] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [featured, setFeatured] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [removeCover, setRemoveCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');
  const [authorLabel, setAuthorLabel] = useState('');

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${APIHOST}/api/admin/protected`);
      setAuth(res.data.access);
    } catch {
      setAuth(false);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (mode !== 'edit' || !id || !auth) return;
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${APIHOST}/api/admin/blogs/${id}`);
        const blog = res.data;
        setTitle(blog.title);
        setContent(blog.content);
        setTags((blog.tags || []).join(', '));
        setAuthorId(blog.authorId?._id || blog.authorId);
        setAuthorLabel(
          `${blog.authorName || ''}${blog.authorCurrentCompany ? ` — ${blog.authorCurrentCompany}` : ''}`
        );
        setFeatured(!!blog.featured);
        setCoverPreview(blog.coverImage || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load blog.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [mode, id, auth]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      alert('Cover must be JPEG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Cover image must be under 5MB.');
      return;
    }
    setCoverFile(file);
    setRemoveCover(false);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required.');
      return;
    }
    if (!authorId) {
      alert('Please select an alumni author.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('tags', tags);
    formData.append('authorId', authorId);
    formData.append('featured', featured ? 'true' : 'false');
    if (coverFile) formData.append('coverImage', coverFile);
    if (removeCover) formData.append('removeCover', 'true');

    try {
      if (mode === 'create') {
        await axios.post(`${APIHOST}/api/admin/blogs`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.put(`${APIHOST}/api/admin/blogs/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/admin/blogs');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save blog.');
    } finally {
      setSubmitting(false);
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

  if (authLoading) return <div className="p-4 font-blog">Loading...</div>;

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
        <Link to="/admin/blogs" className="mt-6 underline text-sm">Back to Blogs</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 font-blog flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1c2b4a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 font-blog p-8">
        <p className="text-red-600">{error}</p>
        <Link to="/admin/blogs" className="text-blue-600 underline mt-4 inline-block">Back to blogs</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-blog">
      <div className="p-3 px-4 bg-white flex items-center gap-5 border-b">
        <img src={Logo} alt="iiit kota logo" className="h-[50px]" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create blog' : 'Edit blog'}
          </h1>
          <p className="text-sm text-gray-500">Post on behalf of an alumni author · postedBy records admin</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-5 animate-fade-in">
          <AuthorSearchSelect
            value={authorId}
            onChange={setAuthorId}
            initialLabel={authorLabel}
            disabled={false}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title*</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1c2b4a]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content*</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={14}
              className="w-full border p-3 rounded text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#1c2b4a]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="placement, internship, career-advice"
              className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1c2b4a]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover image (optional)</label>
            {coverPreview && (
              <img src={coverPreview} alt="Cover" className="w-full max-h-44 object-cover rounded-lg border mb-3" />
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCoverChange} className="text-sm" />
            {coverPreview && (
              <button
                type="button"
                onClick={() => {
                  setCoverFile(null);
                  setCoverPreview('');
                  setRemoveCover(true);
                }}
                className="mt-2 text-xs text-red-600 hover:underline"
              >
                Remove cover image
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span>Featured article <span className="text-gray-400">(future-ready)</span></span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#FF6600] text-white font-semibold rounded-full hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {submitting ? 'Saving...' : mode === 'create' ? 'Publish blog' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/blogs')}
              className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
