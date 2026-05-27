import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer.jsx';

const Sitemap = () => {
  const pages = [
    { path: "/", name: "Home" },
    { path: "/signin", name: "Sign In" },
    { path: "/signup", name: "Sign Up" },
    { path: "/directory", name: "Directory" },
    { path: "/about", name: "About" },
    { path: "/alumni/gallery", name: "Gallery" },
    { path: "/alumni/prominent-alumni", name: "Prominent Alumni" },
    { path: "/alumni/job-postings", name: "Jobs Posting" },
    { path: "/alumni/contact", name: "Contact Us" },
    { path: "/events", name: "Events" },
    { path: "/news", name: "News" },
    { path: "*", name: "Not Found" },
  ];

  return (
    <div className="w-full h-full overflow-x-hidden custom-scrollbar bg-white">
      <Navbar />
      <div className='md:mt-40 mt-20 px-6 mb-12'>
      <h1 className="text-center text-3xl font-bold my-6 text-blue-900">Sitemap</h1>
      <ul className="list-disc list-inside mx-4 space-y-2">
        {pages.map((page, index) => (
          <li key={index} className="text-lg">
            <Link to={page.path} className="text-blue-700 hover:underline">
              {page.name}
            </Link>
          </li>
        ))}
      </ul>
      </div>
      <Footer />
    </div>
  );
};

export default Sitemap;
