import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar.jsx';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';

const ReferralChat = () => {
  const { token, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  // Chat state
  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Input state
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  // Ref for scroll to bottom
  const messagesEndRef = useRef(null);

  const fetchChatData = async (showSkeleton = true) => {
    try {
      if (showSkeleton) setLoading(true);
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';
      
      const response = await axios.get(`${apiHost}/api/referral/request/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRequest(response.data.request);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat conversation.');
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (token && id) {
      fetchChatData(true);
    }
  }, [id, token]);

  // Socket.io integration
  useEffect(() => {
    if (!token || !id) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:7034');

    socket.emit('join_room', id);

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit('leave_room', id);
      socket.disconnect();
    };
  }, [id, token]);

  // Auto-scroll to bottom whenever messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';
      const response = await axios.post(`${apiHost}/api/referral/request/${id}/messages`, 
        { text: text.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Append new message to local state immediately
      setMessages((prev) => [...prev, response.data]);
      setText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
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

  const getSenderName = (msg) => {
    if (msg.sender === user?.id) return 'You';
    if (msg.senderRole === 'student') return request?.student?.name || 'Student';
    return request?.alumni?.name || 'Alumni';
  };

  const isClosed = request?.status === 'declined' || request?.status === 'withdrawn';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6 mt-[9rem] max-w-980:mt-[100px] max-w-492:mt-[75px] w-full flex-grow flex flex-col">
        
        {loading ? (
          // Loading State
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col flex-grow items-center justify-center min-h-[450px] animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gray-200 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
        ) : !request ? (
          // Not Found State
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-sm flex-grow flex items-center justify-center min-h-[450px]">
            ⚠️ Referral conversation not found or access denied.
          </div>
        ) : (
          // Active Chat Screen
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-14rem)] min-h-[500px]">
            
            {/* Top context header */}
            <div className="flex items-center justify-between border-b border-gray-250 p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-500 hover:text-[#1c2b4a] font-bold text-sm transition-colors flex items-center gap-1"
                >
                  <span>←</span> <span>Back</span>
                </button>
                <div className="h-6 w-px bg-gray-300 mx-1" />
                <div>
                  <h3 className="font-extrabold text-gray-800 text-sm md:text-base">
                    {user?.role === 'student' ? request.alumni?.name : request.student?.name}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    {request.company}
                    {request.jobId && ` · ${request.jobId}`}
                  </p>
                  {request.jobLink && (
                    <a
                      href={request.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      Job posting
                    </a>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(request.status)}`}>
                {request.status}
              </span>
            </div>

            {/* Messages body */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 text-xs my-auto">
                  💬 Start the conversation by typing a message below.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.sender === user?.id;
                  const showSender = index === 0 || messages[index - 1].sender !== msg.sender;
                  const senderName = getSenderName(msg);

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col max-w-[75%] ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      {/* Sender Name bubble */}
                      {showSender && (
                        <span className="text-[10px] text-gray-400 font-bold mb-1 px-1">
                          {senderName}
                        </span>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isOwn
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Time */}
                      <span className="text-[8px] text-gray-400 mt-1 px-1">
                        {formatTime(msg.sentAt)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-250 bg-white">
              {isClosed ? (
                // Closed Conversation Message
                <div className="text-center text-red-500 font-semibold text-sm bg-red-50 border border-red-100 rounded-xl py-3">
                  🚫 This referral is closed. You cannot send messages.
                </div>
              ) : (
                // Active Send Input Form
                <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                  <textarea
                    rows="1"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-grow p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1c2b4a] max-h-32 resize-none bg-gray-50 focus:bg-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim() || sending}
                    className="h-11 w-11 bg-[#1c2b4a] hover:bg-[#121c31] text-white rounded-xl flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default ReferralChat;
