// components/EventPostForm.js
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import DOMPurify from "dompurify"
import { ClassNames } from '@emotion/react';



let APIHOST = import.meta.env.VITE_API_URL
 

function WordEditor({ value, onChange, className }) {
  const editorRef = useRef();

  useEffect(() => {
    const ALLOWED_TAGS = [
      "P", "BR", "H1", "H2", "H3", "H4", "H5", "H6",
      "B", "I", "U", "STRONG", "EM",
      "UL", "OL", "LI", "A"
    ];

    const cleanNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(node.textContent);
      }

      if (node.nodeType === Node.COMMENT_NODE) {
        return document.createDocumentFragment();
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.nodeName;

        const blockedTags = ["STYLE", "SCRIPT", "XML", "META", "LINK"];
        if (blockedTags.includes(tagName.toUpperCase())) {
          return document.createDocumentFragment();
        }

        const className = node.className || "";
        const classList = className.split(" ");

        // Map Word span styles to HTML tags
        if (classList.includes("TitleChar")) {
          const h1 = document.createElement("h1");
          node.childNodes.forEach(child => h1.appendChild(cleanNode(child)));
          return h1;
        }
        if (classList.includes("SubtitleChar")) {
          const h2 = document.createElement("h2");
          node.childNodes.forEach(child => h2.appendChild(cleanNode(child)));
          return h2;
        }

        // Unwrap any mso-* classes instead of removing them
        if (/\bmso[-a-z]+/i.test(className)) {
          const frag = document.createDocumentFragment();
          node.childNodes.forEach(child => frag.appendChild(cleanNode(child)));
          return frag;
        }

        const hasMsoStyle = Object.values(node.style || {}).some(v =>
          typeof v === 'string' && v.includes('mso-')
        );
        if (hasMsoStyle) {
          const frag = document.createDocumentFragment();
          node.childNodes.forEach(child => frag.appendChild(cleanNode(child)));
          return frag;
        }

        if (!ALLOWED_TAGS.includes(tagName.toUpperCase())) {
          const frag = document.createDocumentFragment();
          node.childNodes.forEach(child => {
            frag.appendChild(cleanNode(child));
          });
          return frag;
        }

        const newNode = document.createElement(tagName);

        if (tagName.toUpperCase() === "A" && node.hasAttribute("href")) {
          newNode.setAttribute("href", node.getAttribute("href"));
        }

        node.childNodes.forEach(child => {
          newNode.appendChild(cleanNode(child));
        });

        return newNode;
      }

      return document.createDocumentFragment();
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const clipboardData = e.clipboardData || window.clipboardData;
      const html = clipboardData.getData("text/html");
      const text = clipboardData.getData("text/plain");

      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const pasteContent = html || text;
      const tempEl = document.createElement("div");
      tempEl.innerHTML = pasteContent;

      const cleaned = Array.from(tempEl.childNodes).map(cleanNode);

      const frag = document.createDocumentFragment();
      cleaned.forEach(node => frag.appendChild(node));

      range.insertNode(frag);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

      if (onChange) {
        onChange(editorRef.current.innerHTML);
      }
    };

    const handleInput = () => {
      if (onChange) {
        onChange(editorRef.current.innerHTML);
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("paste", handlePaste);
      editor.addEventListener("input", handleInput);
    }

    return () => {
      if (editor) {
        editor.removeEventListener("paste", handlePaste);
        editor.removeEventListener("input", handleInput);
      }
    };
  }, [onChange]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || value === undefined) return;
    if (editor.innerHTML !== value) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const scrollY = window.scrollY;

      editor.innerHTML = value;

      if (range) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      window.scrollTo(0, scrollY);
    }
  }, [value]);

  return (
    <div className={className} >
      <style>
        {`
          [contenteditable] a {
            color: blue;
            text-decoration: underline;
            cursor: pointer;
          }
 
        `}
      </style>
      <div
        ref={editorRef}
        contentEditable
        style={{ 
          minHeight: "50px",
          outline: "none"
        }}
        suppressContentEditableWarning
      />
    </div>
  );
}




export function AdminEvents() {



  const [deletedImages, setDeletedImages] = useState({});

  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ title: '', description: '', date: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newImages, setNewImages] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(5)



  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await axios.delete(`${APIHOST}/api/admin/eventposts/${eventId}`);
      alert('Deleted successfully');
      setEvents(events.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Error deleting event', error);
    }
  };

  const markImageForDeletion = (eventId, imageUid) => {
    setDeletedImages(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), imageUid]
    }));

    // Also hide it from preview immediately
    setEvents(prev =>
      prev.map(ev =>
        ev._id === eventId
          ? {
            ...ev,
            images: ev.images.filter(img => img.uid !== imageUid)
          }
          : ev
      )
    );
  };





  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: itemsPerPage };
      const res = await axios.get(`${APIHOST}/api/admin/eventposts`, { params });
      setEvents(res.data.events);
      setTotalPages(Math.ceil(res.data.total / itemsPerPage));
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page]);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    setPage(1);
    fetchEvents();
  };

  const resetFilters = () => {
    setFilters({ title: '', description: '', date: '' });
    setPage(1);
    fetchEvents();
  };

  const handlePageChange = (direction) => {
    if (direction === 'next' && page < totalPages) setPage(p => p + 1);
    if (direction === 'prev' && page > 1) setPage(p => p - 1);
  };

  const startEditing = (event) => {
    setEditingId(event._id);
    setEditFormData({ title: event.title, description: event.description, details: event.details, date: event.date });
    setNewImages({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({});
    setNewImages({});
  };

  function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    autoResize(e.target);
  };

  const handleImageUpload = (eventId, e) => {
    setNewImages(prev => ({ ...prev, [eventId]: Array.from(e.target.files) }));
  };



  const saveChanges = async (eventId) => {
    const formData = new FormData();
    Object.entries(editFormData).forEach(([key, value]) => formData.append(key, value));

    if (deletedImages[eventId]?.length > 0) {
      formData.append("deletedImages", JSON.stringify(deletedImages[eventId]));
    }

    if (newImages[eventId]) {
      newImages[eventId].forEach(img => formData.append("images", img));
    }

    try {
      const res = await axios.put(`${APIHOST}/api/admin/eventposts/${eventId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditingId(false);

      setDeletedImages(prev => {
        const copy = { ...prev };
        delete copy[eventId];
        return copy;
      });
      // fetchEvents();



      const updatedEvent = res.data.post || res.data;
      setEvents(prevEvents =>
        prevEvents.map(ev =>
          ev._id === eventId ? updatedEvent : ev
        )
      );

    } catch (error) {
      window.alert("error saving changes", error)
    }


  };








  //Logic New post creation part:
  const [newPost, setNewPost] = useState(false)
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    details: '',
    date: ''
  });
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).map(file => ({
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'pending',
      id: Math.random().toString(36).substring(2, 9)
    }));
    setFiles(selectedFiles);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (files.length === 0) return;


    const formPayload = new FormData();
    formPayload.append("title", formData.title);
    formPayload.append("description", formData.description);
    formPayload.append("details", formData.details);
    formPayload.append("date", formData.date);

    files.forEach(fileObj => {
      formPayload.append("images", fileObj.file); // important: field name must match backend
    });

    try {
      setUploadStatus("Uploading...");
      const res = await axios.post(`${APIHOST}/api/admin/eventposts`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total;
          const loaded = progressEvent.loaded;
          const progress = Math.round((loaded / total) * 100);
          setUploadProgress({ global: progress });
        },
      });

      const newEvent = res.data.eventPost || res.data;
      setEvents(prev => [newEvent, ...prev]);

      setUploadStatus("Event created successfully!");
      setNewPost(false)
      setTimeout(()=>{
        setUploadStatus("")
      }, 2000)
      
      setFormData({ title: "", description: "", details: "", date: "" });
      fileInputRef.current.value = '';
      setFiles([]);
      fetchEvents()
    } catch (err) {
      console.error("Error creating event:", err);
      setUploadStatus("Failed to create event.");
    }
  };


  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };








  return (
    <div className="  mx-auto   p-4 px-8 space-y-6">

      {/* Filter one is here:  */}
      <div className=" space-y-2 xl:w-[800px]">
        <div className='flex flex-col    gap-2 md:flex-row md:items-center md:gap-4' >
          <input
            type="text"
            name="title"
            placeholder="Search by Title"
            value={filters.title}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded-md w-1/3"
          />


          <input
            type="text"
            name="description"
            placeholder="Search by Description"
            value={filters.description}
            onChange={handleInputChange}

            className="w-full border px-3 py-2 rounded-md w-1/3"
          />
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleInputChange}
            className="w-fit border px-3 py-2 rounded-md"
          />

        </div>

        <div className='flex flex-wrap    gap-2' >
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:opacity-80 transition"
          >
            Search
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-200 text-black px-4 py-2 rounded-full hover:opacity-80 transition"
          >
            Reset
          </button>

          <button
            onClick={() => { fetchEvents() }}
            className=" bg-black text-white px-4 py-2 rounded-full hover:opacity-80 transition"
          >
            Refresh Data
          </button>

          {!newPost ? (<button
            onClick={() => { setNewPost(true) }}
            className=" bg-black text-white px-4 py-2 rounded-full hover:opacity-80 transition"
          >
            New Post
          </button>) : (
            <button onClick={() => { setNewPost(false) }} className='  bg-red-500 text-white px-4 py-2 rounded-full hover:opacity-80 transition' >
              Cancel
            </button>
          )
          }

        </div>
      </div>



      {
        newPost &&
        <div className="  xl:w-[1000px]    px-4 py-5 bg-white rounded-xl  transition ">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Event Post</h2>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  name="title"
                  placeholder='Enter Post Title'
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                {/* <textarea
                  name="description"
                  value={formData.description}
                  placeholder='Enter Post Description Here'
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  required
                /> */}

                <WordEditor
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.description ? formData.description : "Put description here "}
                  onChange={(html) => setFormData({ ...formData, description: html })}
                />

              </div>

              <div className="mb-4">
                {/* <textarea
                  name="details"
                  value={formData.details}
                  placeholder='Enter Post Details Here'
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  rows="5"
                  required
                /> */}

                <WordEditor
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.details ? formData.details : "Put details here "}
                  onChange={(html) => setFormData({ ...formData, details: html })}
                />
              </div>

              <div className='my-4 text-sm rounded-md   w-fit p-2 bg-gray-100'>
                <p>It is advised to paste description and details directly from MS Word. <br /> Only simple text styles like <span className='font-medium' > Bold, Italics, Underline and Links are supported. </span> </p>
              </div>

              <div className='mb-4 flex gap-2 '  >
                <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="  px-3 py-1 border rounded-md"
                    required
                  />
                </div>

                <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  />
                </div>

              </div>

              {/* File list with progress */}


              {
                files.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {files.map(file => (
                      <div key={file.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex-1 truncate">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full 
                          ${file.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${file.status === 'uploading' ? 'bg-blue-100 text-blue-800' : ''}
                          ${file.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                          ${file.status === 'error' ? 'bg-red-100 text-red-800' : ''}`}>
                              {file.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {file.status === 'uploading' && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                )
              }

              <div   >
                <button
                  type="submit"
                  disabled={!formData.title || !formData.description || !formData.details || !formData.date}
                  className="  bg-green-600 text-white px-5 py-2 rounded-full hover:opacity-80 transition mr-2
                  disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Create Event Post
                </button>



              </div>
            </form>

            {uploadStatus && (
              <p className={`mt-4 text-sm text-center ${uploadStatus.includes('success') ? 'text-green-600' : 'text-red-600'
                }`}>
                {uploadStatus}
              </p>
            )}

          </div>


        </div>
      }









      {loading ? (
        <div className='border p-6 flex justify-center items-center h-[300px] rounded-2xl xl:w-[1100px] border-2 border-white-100 bg-gray-200' >
          <p className="text-center">Wait... Loading Events...</p>

        </div>

      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (

        events.map(event => (

          <div key={event._id} className="border p-6 rounded-2xl xl:w-[1100px]  bg-white">
            {editingId === event._id ? (
              <div className="space-y-3">

                <h2 className="text-2xl font-bold   text-black">

                  <input
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className="w-full border   rounded-md"
                  />

                </h2>


                <input
                  type="date"
                  name="date"
                  value={editFormData.date?.substring(0, 10)}
                  onChange={handleEditChange}
                  className="  border px-3 py-2 rounded-md"
                /> 
                {/* <textarea
                  name="description"
                  value={editFormData.description}

                  onChange={handleEditChange}
                  className="w-full border px-3 py-2 rounded-md"
                /> */}
 
                <WordEditor
                  className="w-full px-3 py-2 border rounded-md"
                  value={editFormData.description ? editFormData.description : "Put description here "}
                  onChange={(html) => setEditFormData({ ...editFormData, description: html })}
                />


                {/* <textarea
                  name="details"
                  value={editFormData.details}
                  onChange={handleEditChange}
                  className="w-full border px-3 py-2 rounded-md"
                /> */}

                <WordEditor
                className="w-full px-3 py-2 border rounded-md"
                value={editFormData.details ? editFormData.details : "Put details here "}
                onChange={(html) => setEditFormData({ ...editFormData, details: html })}
                />

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(event._id, e)}
                />
                <span> Max 5 images </span>

                <div className="flex flex-wrap gap-2">
                  {event.images.map(img => (
                    <div key={img.uid} className="relative">
                      <img
                        src={`${APIHOST}${img.path}`}
                        alt={img.filename}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <button
                        onClick={() => markImageForDeletion(event._id, img.uid)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                      > × </button>
                    </div>
                  ))}
                </div>


                <div className="flex gap-3 mt-6">
                  {/* Edit */}

                  <button
                    onClick={cancelEditing}
                    className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-full hover:opacity-80 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => saveChanges(event._id)}
                    className="flex items-center bg-green-600 text-white px-4 py-2 rounded-full hover:opacity-80 transition"
                  >

                    Save
                  </button>


                  <button
                    onClick={() => handleDelete(event._id)}
                    className="float-right flex items-center bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 512 512"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M64 128v320c0 35.3 28.7 64 64 64h256c35.3 0 64-28.7 64-64V128H64zm320-64h-96l-9.4-18.7C271.6 39.2 265.1 32 256 32h-64c-9.1 0-15.6 7.2-22.6 13.3L160 64H64v32h384V64h-64z" />
                    </svg>
                    Delete
                  </button>
                </div>


              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-black  ">{event.title}</h2>
                    <div className="flex items-center mt-2 text-gray-700 text-sm">
                      <div className="w-5 h-5 mr-2">
                        <svg
                          viewBox="0 0 512 512"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M400 64h-48V32h-32v32H192V32h-32v32h-48c-35.3 0-64 28.7-64 64v320c0 35.3 28.7 64 64 64h288c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64zm32 384c0 17.7-14.3 32-32 32H112c-17.7 0-32-14.3-32-32V192h352v256zm0-288H80v-32c0-17.7 14.3-32 32-32h48v32h32v-32h128v32h32v-32h48c17.7 0 32 14.3 32 32v32z" />
                        </svg>
                      </div>
                      {/* <span>{new Date(event.date).toDateString()}</span> */}
                      <p className=" ">{new Date(event.date).toDateString()}</p>
                    </div>
                  </div>
                </div>
                <p dangerouslySetInnerHTML={ { __html: event.description.toString() }} className="mt-4 text-black"></p>
                <p dangerouslySetInnerHTML={{ __html: event.details.toString() }} className="mt-4 text-black"></p>

                {event.images?.length > 0 && (
                  <div className="mt-4 border rounded-xl flex-wrap w-fit flex gap-4 p-3 ">
                    {event.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={`${APIHOST}${img.path}`}
                        alt={img.filename}
                        className="rounded-md h-32 object-cover"
                      />
                    ))}
                  </div>
                )}


                <div className="flex gap-3 mt-6">
                  {/* Edit */}
                  <button
                    onClick={() => startEditing(event)}
                    className="flex items-center bg-black text-white px-4 py-2 rounded-full hover:opacity-80 transition"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 512 512"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M373.1 35.5c-8.4 0-16.6 3.2-22.9 9.5L320 75.3l116.7 116.7 30.3-30.3c12.6-12.6 12.6-33.1 0-45.7L395.9 45C389.6 38.7 381.5 35.5 373.1 35.5zM287.9 107.3L63.9 331.3c-3.8 3.8-6.6 8.6-8.1 13.8L32 447.5c-3.2 12.2 7.6 23 19.8 19.8l102.4-23.8c5.2-1.2 10-4.1 13.8-8.1l224-224-104.1-104.1z" />
                    </svg>
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 512 512"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M64 128v320c0 35.3 28.7 64 64 64h256c35.3 0 64-28.7 64-64V128H64zm320-64h-96l-9.4-18.7C271.6 39.2 265.1 32 256 32h-64c-9.1 0-15.6 7.2-22.6 13.3L160 64H64v32h384V64h-64z" />
                    </svg>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))


      )}



      <div className="flex justify-between mt-6 xl:w-[800px]" >
        <button
          onClick={() => handlePageChange('prev')}
          disabled={page === 1}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-600">Page {page} of {totalPages}</span>
        <button
          onClick={() => handlePageChange('next')}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}






