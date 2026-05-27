import axios from "axios";
import { useState, useEffect, useRef } from "react";


 
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


export function NewsList() {

  const [news, setNews] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('')
  const [filters, setFilters] = useState({
    title: "",
    content: "",
    postedOn: "",
  })

  const [currentPage, setCurrentPage] = useState(1);
  let [itemsPerPage, setItemsPerPage] = useState(10);
  let [totalPages, setTotalPages] = useState(1);
  let [totalCount, setTotalCount] = useState(0);
  let [loading, setLoading] = useState(false);

  let [appliedFilters, setAppliedFilters] = useState({});


  // Handling the edit post thing here
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const handleEdit = (post) => {
    setEditingId(post._id);
    setFormData({ ...post });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      let response = await axios.put(`${APIHOST}/api/admin/news/${editingId}`, formData);

      setNews((prev) =>
        prev.map((a) => (a._id === editingId ? { ...formData, _id: a._id } : a))
      );

      setEditingId(null);

      
    } catch (error) {
      console.error("Failed to update news: ", error)
    }
  }





  //  Fetching the news with filters set in appliedFilters
  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${APIHOST}/api/admin/news`,
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            ...appliedFilters
          }
        }

      );

      setNews(response.data.news)
      setTotalPages(response.data.totalPages)
      setTotalCount(response.data.totalCount)

    } catch (error) {
      window.alert("Error feteching news data: ", error)
    } finally {
      setLoading(false)
    }
  }







  // Handling the add new post thing here:

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    postedOn: ""
  })

  const handleNewPostChange = (field, value) => {
    setNewPost((prev) => ({ ...prev, [field]: value }));
  }

  const handleAddPost = async () => {
    try {
      setUploadStatus("Uploading...");

      const response = await axios.post(`${APIHOST}/api/admin/news`, newPost);
      setNews((prev) => [response.data.news, ...prev]);
      setNewPost({ title: "", content: "", postedOn: "" });
      setShowAddForm(false); 

      setUploadStatus("Event created successfully!");
      setTimeout(() => {
        setUploadStatus("")
      }, 2000)
    } catch (error) {
      window.alert("Failed to add news post:", error);
      setUploadStatus("Failed to create event.");
    }
  }


  // Handling the delete post

  const handleDelete = async (id) => {

    try {
      if (!window.confirm("Are you sure you want to delete this event? ")) return;
      await axios.delete(`${APIHOST}/api/admin/news/${id}`);

      setNews((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Failed to delete news:", error)
    }
  }



  useEffect(() => {

    fetchNews();
  }, [currentPage, itemsPerPage, appliedFilters])

  return (
    <div className="px-8 py-4" >

      {/* Search Section */}
      <div className="mb-6 space-y-2 xl:w-[800px]">
        <div className="flex flex-col   gap-2 md:flex-row md:items-center md:gap-4">
          <input
            type="text"
            placeholder="Search by Title"
            value={filters.title}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full border px-3 py-2 rounded-md w-1/3"
          />
          <input
            type="text"
            placeholder="Search by Content"
            value={filters.content}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, content: e.target.value }))
            }
            className="w-full border px-3 py-2 rounded-md w-1/3"
          />
          <input
            type="date"
            value={filters.postedOn}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, postedOn: e.target.value }))
            }
            className="w-fit border px-3 py-2 rounded-md"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAppliedFilters({ ...filters })}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:opacity-80 transition"
          >
            Search
          </button>
          <button
            onClick={() => {
              const cleared = { title: "", content: "", postedOn: "" };
              setFilters(cleared);
              setAppliedFilters(cleared);
              fetchNews();
            }}
            className="bg-gray-200 text-black px-4 py-2 rounded-full hover:opacity-80 transition"
          >
            Reset
          </button>


          <button
            onClick={() => fetchNews()}
            className=" bg-black text-white px-4 py-2 rounded-full hover:opacity-80 transition"
          >
            Refresh Data
          </button>

          {!showAddForm ? (<button
            onClick={() => setShowAddForm(true)}
            className=" bg-black text-white px-4 py-2 rounded-full hover:opacity-80 transition"
          >
            New Post
          </button>) : (
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewPost({ title: "", content: "" });
              }}
              className=" bg-red-500 text-white px-4 py-2 rounded-full hover:opacity-80 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>


      <div className="mb-4">
        {!showAddForm ? (
          <></>
        ) : (
          <div className="xl:w-[1000px]    px-4 py-5 bg-white rounded-xl  transition  ">


            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create News Post</h2>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Title"
                value={newPost.title}
                onChange={(e) => handleNewPostChange("title", e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
              {/* <textarea
                type="text"
                placeholder="Content"
                value={newPost.content}
                onChange={(e) => handleNewPostChange("content", e.target.value)}
                className="w-full px-3 py-2 border rounded-md  "
              /> */}


              <WordEditor
                className="w-full px-3 py-2 border rounded-md"
                value={newPost.content ? newPost.content : "Put content here "}
                onChange={(html) => setNewPost({ ...newPost, content: html })}
              />

              <div className='my-4 text-sm rounded-md   w-fit p-2 bg-gray-100'>
                <p>It is advised to paste content directly from MS Word. <br /> Only simple text styles like <span className='font-medium' > Bold, Italics, Underline and Links are supported. </span> </p>
              </div>

              <input
                type="date"
                value={newPost.postedOn}
                onChange={(e) => handleNewPostChange("postedOn", e.target.value)}
                className="w-fit px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex gap-2">


              <div className="flex gap-2 mt-3">



                <button
                  onClick={handleAddPost}
                  disabled={!newPost.title || !newPost.content || !newPost.postedOn}
                  className="flex items-center bg-green-600 text-white px-4 py-2 rounded-full hover:opacity-80 transition
                   disabled:bg-gray-400 disabled:cursor-not-allowed "
                >

                  Create New Post
                </button>



              </div>
              <div>
                {uploadStatus && (
                  <p className={`mt-4 text-sm text-center ${uploadStatus.includes('success') ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {uploadStatus}
                  </p>
                )}
              </div>


            </div>
          </div>
        )}
      </div>

 
      {
        loading ? (
          <div className='border flex items-center justify-center h-[300px] p-6 rounded-2xl xl:w-[1100px] border-2 border-white-100 bg-gray-200' >
            <p className="text-center">Wait... Loading Events...</p>

          </div>

        ) : (
          <div className="space-y-2">
            {news.map((post) => {
              const isEditing = editingId === post._id;

              return (
                <div key={post._id} className="border p-6   rounded-2xl xl:w-[1100px] bg-white">


                  {/* Editable Fields */}
                  <div className="space-y-3">
                    {isEditing ? (
                      <>
                        <input
                          value={formData.title}
                          onChange={(e) => handleChange("title", e.target.value)}
                          className="w-full border p-1 rounded"
                        />
                        {/* <textarea
                        value={formData.content}
                        onChange={(e) => handleChange("content", e.target.value)}
                        className="w-full border p-1 rounded"
                      /> */}

                        <WordEditor
                          className="w-full px-3 py-2 border rounded-md"
                          value={formData.content ? formData.content : "Put description here "}
                          onChange={(html) => setFormData({ ...formData, content: html })}
                        />

                        <input
                          type="date"
                          value={
                            formData.postedOn
                              ? new Date(formData.postedOn).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => handleChange("postedOn", e.target.value)}
                          className=" border p-1 rounded"
                        />




                        <div className="flex gap-2 mt-3">
                          {/* Edit */}

                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-full hover:opacity-80 transition"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={handleSave}
                            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-full hover:opacity-80 transition"
                          >

                            Save
                          </button>


                          <button
                            onClick={() => handleDelete(post._id)}
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

                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-black">{post.title}</h3>
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
                          <p className=" ">{new Date(post.postedOn).toDateString()}</p>
                        </div>
                        <p dangerouslySetInnerHTML={{ __html: post.content.toString() }} className="mt-4 text-black"></p>




                        <div className="flex gap-3 mt-6">
                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(post)}
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
                            onClick={() => handleDelete(post._id)}
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





                </div>

              );
            })}
          </div>

        )
      }





      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-10 px-4 py-3 bg-gray-100 rounded-lg shadow-sm xl:w-[800px]">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md transition font-medium ${currentPage === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gray-300 hover:bg-gray-400"
            }`}
        >
          Previous
        </button>

        <div className="text-gray-800 font-semibold">
          Page {currentPage} of {totalPages}
        </div>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md transition font-medium ${currentPage === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gray-300 hover:bg-gray-400"
            }`}
        >
          Next
        </button>
      </div>




    </div >
  )
}

