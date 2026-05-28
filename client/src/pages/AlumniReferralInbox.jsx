import { useState, useEffect, useRef } from 'react';
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

  const [profile, setProfile] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('All');

  const [editingLimit, setEditingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState(5);

  const [expandedMessages, setExpandedMessages] = useState(new Set());

  const [activeResponseId, setActiveResponseId] = useState(null);
  const [responseStatus, setResponseStatus] = useState('');
  const [alumniMessage, setAlumniMessage] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Sliding tab indicator
  const tabs = ['All', 'Pending', 'Accepted', 'Declined'];
  const tabsRef = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const idx = tabs.indexOf(selectedTab);
    const el = tabsRef.current[idx];
    if (el) setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [selectedTab]);

  const fetchProfileAndInbox = async () => {
    try {
      setLoading(true);
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';
      const [profileRes, inboxRes] = await Promise.all([
        axios.get(`${apiHost}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiHost}/api/referral/inbox`, { headers: { Authorization: `Bearer ${token}` } })
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
    if (token) fetchProfileAndInbox();
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
      setProfile((prev) => ({ ...prev, weeklyReferralLimit: newLimit }));
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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

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
    if (!name) return 'S';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredInbox = inbox.filter((req) => {
    if (selectedTab === 'All') return true;
    return req.status.toLowerCase() === selectedTab.toLowerCase();
  });

  const received = profile?.referralsReceivedThisWeek || 0;
  const limit = profile?.weeklyReferralLimit || 5;
  const progressPct = Math.min((received / limit) * 100, 100);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 py-8 mt-[9rem] max-w-980:mt-[100px] max-w-492:mt-[75px] w-full flex-grow flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold text-[#1c2b4a]">Referral inbox</h2>

          {/* Settings Row */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">

            {/* Weekly limit edit — change 9: pencil emoji replaced with SVG icon */}
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
                  {/* Change: navy Save button */}
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
                  <span className="text-xl font-extrabold text-gray-800">{limit} requests</span>
                  {/* Change 9: replaced ✏️ with clean SVG pencil */}
                  <button
                    onClick={() => { setNewLimit(limit); setEditingLimit(true); }}
                    className="text-gray-400 hover:text-[#1c2b4a] transition-colors"
                    title="Edit weekly limit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Change 10: progress bar instead of "X of Y requests" text */}
            <div className="sm:text-right flex-1 sm:max-w-xs">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Received This Week</h3>
              <div className="group relative">
                {/* rounded progress bar */}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1c2b4a] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {/* tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1c2b4a] text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                  {received} of {limit} requests
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{received} of {limit} used</p>
            </div>

          </div>
        </div>

        {/* Tab Filters — sliding indicator same as student page */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div className="relative flex bg-gray-100 rounded-full p-1">
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
                className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-colors duration-300 ${selectedTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-700'
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
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {req.student?.profilePicture ? (
                        <img src={req.student.profilePicture} alt={req.student.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1c2b4a] font-bold flex items-center justify-center text-lg border border-blue-200">
                          {getInitials(req.student?.name)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800 text-base">{req.student?.name || 'Unknown Student'}</h4>
                          {req.student?.linkedin && (
                            <a href={req.student.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
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

                  {/* Request details */}
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

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4 mt-2">
                  <button
  onClick={() => {
    if (!req.resumeUrl) {
      toast.error('Resume not available.');
      return;
    }
    window.open(req.resumeUrl, '_blank', 'noopener,noreferrer');
  }}
  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg transition-colors"
>
  View resume
</button>

                    <div className="flex gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setActiveResponseId(req._id); setResponseStatus('declined'); setAlumniMessage(''); }}
                            className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 font-semibold text-xs rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                          {/* Change: Accept button navy blue */}
                          <button
                            onClick={() => { setActiveResponseId(req._id); setResponseStatus('accepted'); setAlumniMessage(''); }}
                            className="px-4 py-2 bg-[#1c2b4a] hover:bg-[#121c31] text-white font-semibold text-xs rounded-lg transition-colors"
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

                  {/* Declined message */}
                  {req.status === 'declined' && req.alumniMessage && (
                    <div className="text-gray-500 text-xs italic bg-red-50/50 border border-red-100 rounded-lg p-3">
                      Reason: "{req.alumniMessage}"
                    </div>
                  )}

                  {/* Inline response form */}
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
                          onClick={() => { setActiveResponseId(null); setAlumniMessage(''); }}
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
