import { useState, useEffect } from 'react';
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

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';
      const response = await axios.get(`${apiHost}/api/referral/my-requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
    if (token) {
      fetchRequests();
    }
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
    if (message.length < 50) {
      toast.error('Message must be at least 50 characters long.');
      return;
    }
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
      
      // Reset inputs & close modal
      setShowModal(false);
      setCompany('');
      setRole('');
      setMessage('');
      setJobLink('');
      setResumeFile(null);
      setResumeFileName('No file chosen');

      // Refresh list
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
        headers: {
          Authorization: `Bearer ${token}`
        }
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
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  const filteredRequests = requests.filter((req) => {
    if (selectedTab === 'All') return true;
    return req.status.toLowerCase() === selectedTab.toLowerCase();
  });

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />

      {/* Main layout wrapper matching other pages */}
      <div className="max-w-6xl mx-auto px-4 py-8 mt-[9rem] max-w-980:mt-[100px] max-w-492:mt-[75px] w-full flex-grow flex flex-col gap-8">
        
        {/* SECTION 1: Send Request */}
        <section className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[#1c2b4a] mb-2">Send a referral request</h2>
          <div className="bg-blue-50 text-blue-900 border border-blue-100 rounded-xl p-4 mb-6 text-sm">
            💡 Our system automatically picks the right alumni based on company and role. You will see who was matched after submitting.
          </div>

          <form onSubmit={handleOpenModal} className="flex flex-col md:flex-row gap-4 items-end">
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
            <button
              type="submit"
              className="w-full md:w-auto h-12 px-6 bg-[#1c2b4a] hover:bg-[#121c31] text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              Request referral
            </button>
          </form>
        </section>

        {/* Modal: Complete Request */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
              
              {/* Close Button */}
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
                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message to alumni*</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide context, links to your projects, or why you'd be a good fit (minimum 50 characters)..."
                    required
                    rows="4"
                    className="w-full p-4 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1c2b4a] resize-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {message.length} / 50 characters minimum
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Upload resume (PDF only)*</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      required
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                      <span className="text-[#1c2b4a] font-semibold hover:underline">Choose PDF</span>
                      <p className="text-xs text-gray-400 mt-1">Max file size 5MB</p>
                    </div>
                  </div>
                  <span className="block mt-2 text-xs font-semibold text-gray-600">{resumeFileName}</span>
                </div>

                {/* Job Link */}
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

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#1c2b4a] hover:bg-[#121c31] text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-t-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send request"
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
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Pending', 'Accepted', 'Declined', 'Withdrawn'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider border transition-all ${
                    selectedTab === tab
                      ? 'bg-[#1c2b4a] text-white border-[#1c2b4a]'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
                <div
                  key={req._id}
                  className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  {/* Left Side: Alumni info */}
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

                  {/* Middle Side: Company and Role */}
                  <div>
                    <h5 className="font-bold text-gray-800 text-sm">{req.role}</h5>
                    <p className="text-xs text-gray-500 font-semibold">{req.company}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Sent on {formatDate(req.sentAt)}</p>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(req.status)}`}>
                      {req.status}
                    </span>

                    {/* Action buttons */}
                    <div className="flex gap-2">
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
