// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

import Navbar from '../components/navbar';

const NotFound = () => {
  return (
    <div className='w-screen h-screen'>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl font-semibold mb-6">Page Not Found</p>
      <p className="mb-8 text-gray-600">The page you are looking for doesn’t exist.</p>
      <Link
        to="/"
        className="bg-blue-950 text-white px-6 py-2 rounded-md text-lg font-medium hover:bg-[#19194D] transition duration-300"
      >
        Go to Home
      </Link>
    </div>
    </div>
  );
};

export default NotFound;
