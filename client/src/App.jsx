// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DeansMessage from './pages/Deans_message';
import Directory from './pages/Directory';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Gallery from './pages/Gallery';
import ProminentAlumni from './pages/ProminentAlumni';
import Events from './pages/Events';
import ContactUs from './pages/ContactUs';
import JobsPosting from './pages/JobsPosting';
import Loading from './pages/Loading';
import NotFound from './pages/NotFound';
import JobDetails from './pages/JobDetails';
import EventDetails from './pages/EventDetails';
import News from './pages/News';
import Sitemap from './pages/Sitemap';
import AuthRedirect from './components/AuthRedirect';
import StudentSignIn from './pages/StudentSignIn';
import StudentSignUp from './pages/StudentSignUp';
import ProtectedRoute from './components/ProtectedRoute';
import StudentReferral from './pages/StudentReferral';
import AlumniReferralInbox from './pages/AlumniReferralInbox';
import ReferralChat from './pages/ReferralChat';

import AdminPanelHome from './pages/AdminPanelHome';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust delay as needed

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="w-screen h-screen bg-[#19194D]">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Auth Routes - Protected from authenticated users */}
          <Route path="/signin" element={
            <AuthRedirect>
              <SignIn />
            </AuthRedirect>
          } />
          <Route path="/signup" element={
            <AuthRedirect>
              <SignUp />
            </AuthRedirect>
          } />
          <Route path="/student-signin" element={<StudentSignIn />} />
          <Route path="/student-signup" element={<StudentSignUp />} />
          <Route path="/forgot-password" element={
            <AuthRedirect>
              <ForgotPassword />
            </AuthRedirect>
          } />
          <Route path="/reset-password/:token" element={
            <AuthRedirect>
              <ResetPassword />
            </AuthRedirect>
          } />

          {/* Regular Routes */}
          <Route path="/deans-message" element={<DeansMessage />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/alumni/gallery" element={<Gallery />} />
          <Route path="/alumni/prominent-alumni" element={<ProminentAlumni />} />
          <Route path="/alumni/job-postings" element={<JobsPosting />} />
          <Route path="/alumni/contact" element={<ContactUs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:newsId" element={<News />} />
          <Route path="/alumni/job-postings/:id" element={<JobDetails />} />
          <Route path="/events/:title" element={<EventDetails />} />
          <Route path="/sitemap" element={<Sitemap />} />
          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/referrals" element={<StudentReferral />} />
          </Route>

          {/* Protected Alumni Routes */}
          <Route element={<ProtectedRoute allowedRoles={['alumni']} />}>
            <Route path="/referral-inbox" element={<AlumniReferralInbox />} />
          </Route>

          {/* Protected Chat Routes (Shared) */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'alumni']} />}>
            <Route path="/referral-chat/:id" element={<ReferralChat />} />
          </Route>

          <Route path="*" element={<NotFound />} />
          <Route path="/admin" element={<AdminPanelHome />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
