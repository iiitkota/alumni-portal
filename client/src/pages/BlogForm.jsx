import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';

const BlogForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { computedRole, isAdmin } = useOutletContext() || {};

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [removeCover, setRemoveCover] = useState(false);
  const [authorId, setAuthorId] = useState('');
  const [alumniList, setAlumniList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');

  useEffect(() => {
    if (isAdmin) {
      axios.get(`${apiHost}/api/alumni`, { params: { page: 1, limit: 500 } })
        .then((res) => setAlumniList(res.data.alumni || []))
        .catch(() => toast.error('Failed to load alumni list.'));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${apiHost}/api/blogs/${id}?trackView=false`);
        const blog = res.data;
        setTitle(blog.title);
        setContent(blog.content);
        setTags((blog.tags || []).join(', '));
        setCoverPreview(blog.coverImage || '');
        setAuthorId(blog.authorId);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load article.');
        navigate('/blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [mode, id, navigate]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Cover must be JPEG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover image must be under 5MB.');
      return;
    }
    setCoverFile(file);
    setRemoveCover(false);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    if (isAdmin && mode === 'create' && !authorId) {
      toast.error('Please select an alumni author.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('tags', tags);
    if (coverFile) formData.append('coverImage', coverFile);
    if (removeCover) formData.append('removeCover', 'true');
    if (isAdmin && mode === 'create') formData.append('authorId', authorId);

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      if (mode === 'create') {
        await axios.post(`${apiHost}/api/blogs`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        toast.success('Article published successfully.');
      } else {
        await axios.put(`${apiHost}/api/blogs/${id}`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        toast.success('Article updated successfully.');
      }
      navigate('/blogs');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save article.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 font-blog">
        <Navbar />
        <div className="flex-grow flex items-center justify-center mt-32">
          <div className="w-8 h-8 border-2 border-[#1c2b4a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-blog">
      <Navbar />
      <Toaster position="top-right" />

      <div className="max-w-3xl mx-auto px-4 py-8 mt-[9rem] max-w-980:mt-[100px] w-full flex-grow">
        <div className="border-l-4 border-[#1c2b4a] pl-5 mb-8">
          <h1 className="text-2xl font-bold text-[#1c2b4a]">
            {mode === 'create' ? 'Write an article' : 'Edit article'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Share placement journeys, career advice, or professional insights with the community.
          </p>
          {computedRole === 'admin' && (
            <p className="text-xs text-amber-700 mt-2 font-medium">Posting as admin — select the alumni author below.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          {isAdmin && mode === 'create' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alumni author*</label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                required
                className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c2b4a]"
              >
                <option value="">Select alumni...</option>
                {alumniList.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} — {a.currentCompany}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title*</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. My internship journey at..."
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c2b4a]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content*</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={14}
              placeholder="Write your article here..."
              className="w-full p-4 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#1c2b4a] leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="placement, internship, career-advice"
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c2b4a]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover image (optional)</label>
            {coverPreview && (
              <img src={coverPreview} alt="Cover preview" className="w-full max-h-48 object-cover rounded-lg border border-gray-200 mb-3" />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleCoverChange}
              className="text-sm text-gray-600"
            />
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

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-6 bg-[#1c2b4a] text-white font-medium rounded-lg hover:bg-[#121c31] transition-colors disabled:opacity-60"
            >
              {submitting ? 'Saving...' : mode === 'create' ? 'Publish article' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/blogs')}
              className="h-11 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default BlogForm;
