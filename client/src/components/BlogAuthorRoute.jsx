import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:7034';

const BlogAuthorRoute = () => {
  const { user, token } = useAuth();
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(`${apiHost}/api/admin/protected`, { withCredentials: true });
        setIsAdmin(!!res.data.access);
      } catch {
        setIsAdmin(false);
      } finally {
        setAdminChecked(true);
      }
    };
    checkAdmin();
  }, []);

  if (!adminChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#1c2b4a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const computedRole = isAdmin ? 'admin' : user?.role;
  const canWrite = computedRole === 'alumni' || computedRole === 'admin';

  if (!canWrite) {
    return <Navigate to="/signin" replace />;
  }

  if (computedRole === 'alumni' && !token) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet context={{ computedRole, isAdmin }} />;
};

export default BlogAuthorRoute;
