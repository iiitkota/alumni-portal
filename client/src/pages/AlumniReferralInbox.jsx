import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const AlumniReferralInbox = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // State
  const [profile, setProfile] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('All');

  // Limit settings state
  const [editingLimit, setEditingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState(5);

  // Message truncation state
  const [expandedMessages, setExpandedMessages] = useState(new Set());

  // Respond form state
  const [activeResponseId, setActiveResponseId] = useState(null);
  const [responseStatus, setResponseStatus] = useState(''); // 'accepted' or 'declined'
  const [alumniMessage, setAlumniMessage] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const fetchProfileAndInbox = async () => {
    try {
      setLoading(true);
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';
      
      const [profileRes, inboxRes] = await Promise.all([
        axios.get(`${apiHost}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${apiHost}/api/referral/inbox`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setProfile(profileRes.data);
      setInbox(inboxRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load referral inbox data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfileAndInbox();
    }
  }, [token]);

  const handleSaveLimit = async () => {
    if (newLimit < 1 || newLimit > 20) {
      toast.error('Limit must be between 1 and 20.');
      return;
    }

    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';
      await axios.patch(`${apiHost}/api/referral/limit`, 
        { limit: newLimit },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Weekly referral limit updated.');
      setEditingLimit(false);
      
      // Update local profile state
      setProfile((prev) => ({
        ...prev,
        weeklyReferralLimit: newLimit
      }));
    } catch (error) {
      console.error('Error saving limit:', error);
      toast.error(error.response?.data?.message || 'Failed to update limit.');
    }
  };

  const handleRespond = async (id) => {
    setSubmittingResponse(true);
    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';
      await axios.patch(`${apiHost}/api/referral/request/${id}/respond`,
        { status: responseStatus, alumniMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Request ${responseStatus} successfully.`);
      setActiveResponseId(null);
      setAlumniMessage('');
      
      // Refresh list and stats
      fetchProfileAndInbox();
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error(error.response?.data?.message || 'Failed to record response.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const toggleMessageExpand = (id) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
    if (!name) return 'S';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  const filteredInbox = inbox.filter((req) => {
    if (selectedTab === 'All') return true;
    return req.status.toLowerCase() === selectedTab.toLowerCase();
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 py-8 mt-[9rem] max-w-980:mt-[100px] max-w-492:mt-[75px] w-full flex-grow flex flex-col gap-6">
        
        {/* Top Header */}
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold text-[#1c2b4a]">Referral inbox</h2>
          
          {/* Settings Row */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Weekly Referral Limit</h3>
              {editingLimit ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newLimit}
                    onChange={(e) => setNewLimit(Number(e.target.value))}
                    className="w-20 h-9 px-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1c2b4a] text-sm"
                  />
                  <button
                    onClick={handleSaveLimit}
                    className="h-9 px-4 bg-[#1c2b4a] hover:bg-[#121c31] text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingLimit(false)}
                    className="h-9 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-extrabold text-gray-800">
                    {profile?.weeklyReferralLimit || 5} requests
                  </span>
                  <button
                    onClick={() => {
                      setNewLimit(profile?.weeklyReferralLimit || 5);
                      setEditingLimit(true);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                    title="Edit weekly limit"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>

            <div className="sm:text-right">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Received This Week</h3>
              <span className="text-xl font-extrabold text-gray-800 mt-1 block">
                {profile?.referralsReceivedThisWeek || 0} of {profile?.weeklyReferralLimit || 5} requests
              </span>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div className="flex flex-wrap gap-2">
            {['All', 'Pending', 'Accepted', 'Declined'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider border transition-all ${
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

        {/* Requests List */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div className="flex flex-col gap-2">
                      <div className="h-4 bg-gray-200 rounded w-36" />
                      <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-16 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredInbox.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-sm">
            📁 No referral requests yet
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredInbox.map((req) => {
              const isExpanded = expandedMessages.has(req._id);
              const text = req.message || '';
              const needsTruncation = text.length > 220;
              const displayText = needsTruncation && !isExpanded ? `${text.substring(0, 220)}...` : text;

              return (
                <div
                  key={req._id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 transition-all"
                >
                  
                  {/* Card Header: Student Info & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {req.student?.profilePicture ? (
                        <img
                          src={req.student.profilePicture}
                          alt={req.student.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1c2b4a] font-bold flex items-center justify-center text-lg border border-blue-200">
                          {getInitials(req.student?.name)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800 text-base">{req.student?.name || 'Unknown Student'}</h4>
                          {req.student?.linkedin && (
                            <a
                              href={req.student.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <LinkedInIcon className="!w-5 !h-5" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {req.student?.branch || 'N/A'} • Graduating {req.student?.graduationYear || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                      <span className="text-[10px] text-gray-400">Sent on {formatDate(req.sentAt)}</span>
                    </div>
                  </div>

                  {/* Card Body: Request details */}
                  <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 flex flex-col gap-2">
                    <div className="text-sm">
                      Requesting referral for: <strong className="text-gray-800">{req.role}</strong> at <strong className="text-gray-800">{req.company}</strong>
                    </div>
                    {req.jobLink && (
                      <div className="text-xs text-gray-500">
                        Job Link: <a href={req.jobLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{req.jobLink}</a>
                      </div>
                    )}
                  </div>

                  {/* Student message */}
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {displayText}
                    {needsTruncation && (
                      <button
                        onClick={() => toggleMessageExpand(req._id)}
                        className="text-blue-600 hover:text-[#1c2b4a] font-semibold text-xs ml-1 focus:outline-none"
                      >
                        {isExpanded ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  {/* Action buttons bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4 mt-2">
                    <button
                      onClick={() => window.open(req.resumeUrl, '_blank')}
                      className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg transition-colors"
                    >
                      View resume
                    </button>

                    <div className="flex gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setActiveResponseId(req._id);
                              setResponseStatus('declined');
                              setAlumniMessage('');
                            }}
                            className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 font-semibold text-xs rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => {
                              setActiveResponseId(req._id);
                              setResponseStatus('accepted');
                              setAlumniMessage('');
                            }}
                            className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-50 font-semibold text-xs rounded-lg transition-colors"
                          >
                            Accept
                          </button>
                        </>
                      )}

                      {req.status === 'accepted' && (
                        <button
                          onClick={() => navigate(`/referral-chat/${req._id}`)}
                          className="px-4 py-2 bg-[#1c2b4a] hover:bg-[#121c31] text-white font-semibold text-xs rounded-lg transition-colors"
                        >
                          Chat
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Declined Alumni Message Display */}
                  {req.status === 'declined' && req.alumniMessage && (
                    <div className="text-gray-500 text-xs italic bg-red-50/50 border border-red-100 rounded-lg p-3">
                      Reason: "{req.alumniMessage}"
                    </div>
                  )}

                  {/* Inline Response Form (Accept/Decline) */}
                  {activeResponseId === req._id && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Response Type: <span className={responseStatus === 'accepted' ? 'text-green-600' : 'text-red-600'}>{responseStatus.toUpperCase()}</span>
                        </span>
                        <label className="block text-sm font-semibold text-gray-700 mt-1 mb-1.5">
                          Message to student (optional)
                        </label>
                        <textarea
                          value={alumniMessage}
                          onChange={(e) => setAlumniMessage(e.target.value)}
                          placeholder={responseStatus === 'accepted' ? 'Provide next steps or contact details (optional)...' : 'State reason for decline (optional)...'}
                          rows="3"
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1c2b4a] bg-white resize-none"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setActiveResponseId(null);
                            setAlumniMessage('');
                          }}
                          className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRespond(req._id)}
                          disabled={submittingResponse}
                          className="px-4 py-1.5 bg-[#1c2b4a] hover:bg-[#121c31] text-white font-semibold text-xs rounded-lg transition-colors"
                        >
                          {submittingResponse ? 'Submitting...' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default AlumniReferralInbox;
