import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const StudentReferral = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Requests state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('All');

  // New request inputs
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Modal form inputs
  const [message, setMessage] = useState('');
  const [jobLink, setJobLink] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('No file chosen');
  const [submitting, setSubmitting] = useState(false);

  // Sliding indicator for tabs
  const tabsRef = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabs = ['All', 'Pending', 'Accepted', 'Declined', 'Withdrawn'];

  useEffect(() => {
    const idx = tabs.indexOf(selectedTab);
    const el = tabsRef.current[idx];
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [selectedTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';
      const response = await axios.get(`${apiHost}/api/referral/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch your referral requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRequests();
  }, [token]);

  const handleOpenModal = (e) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      toast.error('Please enter both Company and Role.');
      return;
    }
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds the 5MB limit.');
        return;
      }
      setResumeFile(file);
      setResumeFileName(file.name);
    } else {
      setResumeFile(null);
      setResumeFileName('No file chosen');
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please upload your resume (PDF).');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('company', company);
    formData.append('role', role);
    formData.append('message', message);
    formData.append('jobLink', jobLink);
    formData.append('resume', resumeFile);

    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';
      const response = await axios.post(`${apiHost}/api/referral/request`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      toast.success(response.data.message || 'Referral request sent successfully!');
      setShowModal(false);
      setCompany('');
      setRole('');
      setMessage('');
      setJobLink('');
      setResumeFile(null);
      setResumeFileName('No file chosen');
      fetchRequests();
    } catch (error) {
      console.error('Error submitting referral request:', error);
      if (error.response?.status === 404) {
        toast.error('No alumni available for this company and role right now. Try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit referral request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (id) => {
    const confirmWithdraw = window.confirm('Are you sure? This cannot be undone.');
    if (!confirmWithdraw) return;

    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';
      await axios.delete(`${apiHost}/api/referral/request/${id}/withdraw`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Request withdrawn successfully.');
      fetchRequests();
    } catch (error) {
      console.error('Error withdrawing request:', error);
      toast.error(error.response?.data?.message || 'Failed to withdraw request.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredRequests = requests.filter((req) => {
    if (selectedTab === 'All') return true;
    return req.status.toLowerCase() === selectedTab.toLowerCase();
  });

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-50 text-green-800 border-green-200';
      case 'declined': return 'bg-red-50 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 py-8 mt-[9rem] max-w-980:mt-[100px] max-w-492:mt-[75px] w-full flex-grow flex flex-col gap-8">

        {/* SECTION 1: Send Request — left navy border accent */}
        <section className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
          <div className="border-l-4 border-[#1c2b4a] p-6">
            <h2 className="text-2xl font-bold text-[#1c2b4a] mb-2">Send a referral request</h2>

            {/* Change 4: removed the 💡 bulb info box entirely */}

            <form onSubmit={handleOpenModal} className="flex flex-col md:flex-row gap-4 items-end mt-4">
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company*</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  required
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1c2b4a]"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role*</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  required
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1c2b4a]"
                />
              </div>
              {/* Change: hover effect on Request referral button */}
              <button
                type="submit"
                className="w-full md:w-auto h-12 px-6 bg-[#1c2b4a] text-white font-medium rounded-lg
                  transition-all duration-200 ease-in-out
                  hover:bg-[#121c31] hover:scale-[1.03] hover:shadow-lg
                  active:scale-[0.98] flex items-center justify-center"
              >
                Request referral
              </button>
            </form>
          </div>
        </section>

        {/* Modal: Complete Request */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-xl font-bold text-[#1c2b4a] mb-1">Complete your request</h3>
              <p className="text-gray-500 text-sm mb-6">
                Matching for: <strong className="text-gray-700">{role}</strong> at <strong className="text-gray-700">{company}</strong>
              </p>

              <form onSubmit={handleSubmitRequest} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message to alumni*</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide context, links to your projects, or why you'd be a good fit "
                    required
                    rows="4"
                    className="w-full p-4 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1c2b4a] resize-none"
                  />

                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Upload resume (PDF only)*</label>
                  <div className="relative">
                    {/* Style tag for progress-shimmer animation */}
                    <style>{`
                      @keyframes progress-shimmer {
                        0% { left: -50%; }
                        100% { left: 150%; }
                      }
                      .animate-progress-shimmer {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        width: 50%;
                        background: linear-gradient(to right, transparent, rgba(28, 43, 74, 0.2), transparent);
                        animation: progress-shimmer 1.5s infinite linear;
                      }
                    `}</style>

                    {/* The hidden input overlay, active only in default state so drag/click works */}
                    {!submitting && !resumeFile && (
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        required
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                      />
                    )}

                    {/* State C: While submitting */}
                    {submitting && (
                      <div className="border border-solid border-gray-200 bg-gray-50 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-3">
                        <span className="text-sm font-semibold text-gray-600 animate-pulse">Uploading resume...</span>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                          <div className="animate-progress-shimmer rounded-full" />
                        </div>
                      </div>
                    )}

                    {/* State B: File is selected */}
                    {!submitting && resumeFile && (
                      <div className="border border-solid border-emerald-200 bg-emerald-50/50 rounded-xl p-4 flex items-center justify-between gap-3 transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* Green checkmark icon */}
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-gray-800 truncate" title={resumeFileName}>
                              {resumeFileName.length > 30 ? `${resumeFileName.substring(0, 27)}...` : resumeFileName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {resumeFile.size < 1024 * 1024
                                ? `${(resumeFile.size / 1024).toFixed(1)} KB`
                                : `${(resumeFile.size / (1024 * 1024)).toFixed(1)} MB`}
                            </span>
                          </div>
                        </div>

                        {/* Clear Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setResumeFile(null);
                            setResumeFileName('No file chosen');
                          }}
                          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center font-bold text-lg transition-colors"
                          title="Clear file"
                        >
                          &times;
                        </button>
                      </div>
                    )}

                    {/* State A: Default - No file chosen */}
                    {!submitting && !resumeFile && (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50/50 hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
                        {/* Animated Upload Icon */}
                        <div className="text-[#1c2b4a] animate-bounce">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                        <span className="text-[#1c2b4a] text-sm font-semibold hover:underline">Drop your PDF here or click to upload</span>
                        <p className="text-xs text-gray-400">Max 5MB · PDF only</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job posting link (optional)</label>
                  <input
                    type="url"
                    value={jobLink}
                    onChange={(e) => setJobLink(e.target.value)}
                    placeholder="https://careers.company.com/jobs/..."
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1c2b4a]"
                  />
                </div>

                {/* Change 14: hover effect on Send button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#1c2b4a] text-white font-medium rounded-lg
                    transition-all duration-200 ease-in-out
                    hover:bg-[#121c31] hover:scale-[1.02] hover:shadow-md
                    active:scale-[0.98]
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                    flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-t-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send request'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SECTION 2: My Requests */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold text-[#1c2b4a]">My referral requests</h2>

            {/* Change 6: sliding indicator tab bar */}
            <div className="relative flex bg-gray-100 rounded-full p-1">
              {/* sliding pill */}
              <span
                className="absolute top-1 bottom-1 rounded-full bg-[#1c2b4a] transition-all duration-300 ease-in-out"
                style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              />
              {tabs.map((tab, idx) => (
                <button
                  key={tab}
                  ref={(el) => (tabsRef.current[idx] = el)}
                  type="button"
                  onClick={() => setSelectedTab(tab)}
                  className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-colors duration-300 ${selectedTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div className="flex flex-col gap-2 flex-grow">
                      <div className="h-4 bg-gray-200 rounded w-40" />
                      <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-48" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-sm">
              📁 No referral requests yet
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredRequests.map((req) => (
                /* Change 7: removed justify-between / flex-row on md so content fills width */
                <div
                  key={req._id}
                  className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left: Alumni info */}
                    <div className="flex items-center gap-4">
                      {req.alumni?.profilePicture ? (
                        <img
                          src={req.alumni.profilePicture}
                          alt={req.alumni.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1c2b4a] font-bold flex items-center justify-center text-lg border border-blue-200">
                          {getInitials(req.alumni?.name)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-800 text-base">{req.alumni?.name || 'Unknown Alumni'}</h4>
                        <p className="text-xs text-gray-400">
                          {req.alumni?.branch || 'N/A'} • Graduated {req.alumni?.graduationYear || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Right: status badge + date */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                      <span className="text-[10px] text-gray-400">Sent on {formatDate(req.sentAt)}</span>
                    </div>
                  </div>

                  {/* Company / Role row — fills the white space */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h5 className="font-bold text-gray-800 text-sm">{req.role}</h5>
                      <p className="text-xs text-gray-500 font-semibold">{req.company}</p>
                    </div>

                    {/* Action buttons live inside the info row so nothing floats */}
                    <div className="flex gap-2 flex-shrink-0">
                      {(req.status === 'accepted' || req.status === 'pending') && (
                        <button
                          type="button"
                          onClick={() => navigate(`/referral-chat/${req._id}`)}
                          className="px-3 py-1.5 border border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold text-xs rounded-lg transition-colors"
                        >
                          Chat
                        </button>
                      )}
                      {req.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleWithdraw(req._id)}
                          className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs rounded-lg transition-colors"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>

                  {req.alumniMessage && (req.status === 'accepted' || req.status === 'declined') && (
                    <div className={`text-xs italic text-gray-600 p-3 rounded-lg border-l-4 ${req.status === 'accepted' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                      }`}>
                      {req.status === 'accepted' ? `Alumni's note: ${req.alumniMessage}` : `Reason: ${req.alumniMessage}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default StudentReferral;
