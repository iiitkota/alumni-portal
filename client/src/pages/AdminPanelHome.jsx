import { useState, useEffect } from "react";
import Logo from "../assets/iiitkotalogo.png";
import { NewsList } from "./AdminNews";
import { AdminEvents } from "./AdminEvents";
import { AlumniList } from "./AdminAlumni";
axios.defaults.withCredentials = true;
import axios from "axios";
 
let APIHOST = import.meta.env.VITE_API_URL



function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-semibold rounded-[22px] transition-all duration-200
        ${isActive
          ? "bg-[#FF6600] text-white"
          : "bg-gray-200 text-gray-800 hover:bg-[#FF6600] hover:text-white"
        }`}
    >
      {label}
    </button>
  );
}


export default function AdminPanelHome() {
  const [page, setPage] = useState("Home");
  const pages = ["Home", "News", "Events"];

  const [auth, setAuth] = useState(false);
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(true);


  const checkAuth = async () => {
    try {
      const res = await axios.get(`${APIHOST}/api/admin/protected`);
      setAuth(res.data.access);
    } catch {
      setAuth(false);
    } finally {
      setLoading(false);
    }
  };


  const handleLogin = async () => {
    try {
      const res = await axios.post(`${APIHOST}/api/admin/login`, { key });
      if (res.data.success) {
        await checkAuth();
      } else {
        alert(  res.data.message);
      }
    } catch {
      alert("Login Failed");
    }
  };


  const handleLogout = async () => {
    await axios.post(`${APIHOST}/api/admin/logout`);
    setAuth(false);
    setKey("");
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!auth) return;

    const interval = setInterval(() => {
      checkAuth();  
    }, 60000);  

    return () => clearInterval(interval);
  }, [auth]);



  if (loading) return <div className="p-4 text-white">Loading...</div>;

  if (!auth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-4">
        <img src={Logo} alt="iiit kota logo" className="h-[60px]" />
        <h1 className="text-2xl font-semibold">Admin Key Required</h1>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="border px-4 py-2 rounded w-64"
          placeholder="Enter Admin Key"
        />
        <button
          onClick={handleLogin}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Submit
        </button>


        <div className="mt-10 underline">
          <a href="./">
           Go to Home Page
          </a>
        </div>
      </div>
    );
  }


  return (
    <div className="w-[100%]   bg-gray-100">
      <div className="p-3 px-4 bg-white flex items-center gap-5">
        <img src={Logo} alt="iiit kota logo" className="h-[60px]" />
        <h1 className="text-2xl font-medium">
          IIIT Kota Alumni Portal Admin Panel
        </h1>
      </div>

      <div className="flex bg-white border-t-2 flex-wrap gap-1 gap-y-4 p-4">
        {pages.map((pg) => (
          <TabButton key={pg} label={pg} isActive={page === pg} onClick={() => setPage(pg)} />
        ))}
        <div className="ml-auto flex gap-2 items-center mr-3">

          <button className="flex items-center bg-red-500 text-gray-800 text-white hover:opacity-80 px-4 py-2 font-semibold rounded-[22px] transition-all duration-200  " onClick={handleLogout} >
            <span className="mr-2" >Log out</span>
            <img className="invert" width="20" height="20" src="https://img.icons8.com/fluency-systems-filled/48/exit.png" alt="exit" />

          </button>
        </div>
      </div>

      {page === "Home" && <AlumniList />}
      {page === "News" && <NewsList />}
      {page === "Events" && <AdminEvents />}
    </div>
  );
}
