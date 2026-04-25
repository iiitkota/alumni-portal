import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

let APIHOST = import.meta.env.VITE_API_URL;

export function AdminStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState(false);
  const [formData, setFormData] = useState({ order: 0 });
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${APIHOST}/api/admin/stories`);
      setStories(res.data);
    } catch (err) {
      console.error("Failed to fetch stories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select an image");
      return;
    }

    const payload = new FormData();
    payload.append("order", formData.order);
    payload.append("image", file);

    try {
      setUploadStatus("Uploading to Cloudinary...");
      const res = await axios.post(`${APIHOST}/api/admin/stories`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setStories(prev => [...prev, res.data.story].sort((a,b) => a.order - b.order));
      setUploadStatus("Story created successfully!");
      setNewPost(false);
      setFormData({ order: 0 });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setTimeout(() => {
        setUploadStatus("");
      }, 3000);
    } catch (err) {
      console.error("Error uploading story:", err);
      setUploadStatus("Failed to create story.");
    }
  };

  const handleDelete = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await axios.delete(`${APIHOST}/api/admin/stories/${storyId}`);
      setStories(stories.filter(story => story._id !== storyId));
      alert('Deleted successfully');
    } catch (error) {
      console.error('Failed to delete story:', error);
      alert('Error deleting story');
    }
  };

  const startEditing = (story) => {
    setEditingId(story._id);
    setEditFormData({ order: story.order || 0 });
  };

  const saveChanges = async (storyId) => {
    try {
      const res = await axios.put(`${APIHOST}/api/admin/stories/${storyId}`, { order: editFormData.order });
      setStories(prev => prev.map(st => st._id === storyId ? res.data.story : st).sort((a,b) => a.order - b.order));
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update order", err);
      alert("Error updating order");
    }
  };

  return (
    <div className="mx-auto p-4 px-8 space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => { fetchStories(); }}
          className="bg-black text-white px-4 py-2 rounded-full hover:opacity-80 transition"
        >
          Refresh Data
        </button>
        {!newPost ? (
          <button
            onClick={() => { setNewPost(true); }}
            className="bg-black text-white px-4 py-2 rounded-full hover:opacity-80 transition"
          >
            New Story Image
          </button>
        ) : (
          <button onClick={() => { setNewPost(false); }} className='bg-red-500 text-white px-4 py-2 rounded-full hover:opacity-80 transition'>
            Cancel
          </button>
        )}
      </div>

      {newPost && (
        <div className="xl:w-[800px] px-4 py-5 bg-white rounded-xl transition shadow">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Carousel Image</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!file}
              className="bg-green-600 text-white px-5 py-2 rounded-full hover:opacity-80 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Upload Carousel Image
            </button>
          </form>
          {uploadStatus && (
            <p className={`mt-4 text-sm font-medium ${uploadStatus.includes('success') ? 'text-green-600' : (uploadStatus.includes('Failed') ? 'text-red-600' : 'text-blue-600')}`}>
              {uploadStatus}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className='border p-6 flex justify-center items-center h-[200px] rounded-2xl xl:w-[800px] bg-gray-200'>
          <p className="text-center">Loading Stories...</p>
        </div>
      ) : stories.length === 0 ? (
        <p className="text-gray-500">No carousel stories found. Upload one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:w-[1200px]">
          {stories.map(story => (
            <div key={story._id} className="border p-4 rounded-xl bg-white shadow flex flex-col items-center">
              <img src={story.imageUrl} alt="Carousel Story" className="w-full h-48 object-cover rounded-md mb-4" />
              
              {editingId === story._id ? (
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm font-medium">Order:</label>
                  <input
                    type="number"
                    value={editFormData.order}
                    onChange={(e) => setEditFormData({ order: e.target.value })}
                    className="border px-2 py-1 w-20 rounded"
                  />
                  <button onClick={() => saveChanges(story._id)} className="bg-green-600 text-white px-3 py-1 text-sm rounded">Save</button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-3 py-1 text-sm rounded">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full mb-4 px-2">
                  <span className="font-semibold text-gray-700">Order: {story.order}</span>
                  <button onClick={() => startEditing(story)} className="text-blue-600 hover:text-blue-800 text-sm">Edit Order</button>
                </div>
              )}

              <button
                onClick={() => handleDelete(story._id)}
                className="w-full bg-red-500 text-white py-2 rounded font-medium hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminStories;
