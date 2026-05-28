import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/iiitkotalogo.png";

axios.defaults.withCredentials = true;

const APIHOST = import.meta.env.VITE_API_URL;

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

export function StudentList() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    instituteId: "",
    graduationYear: "",
    branch: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [sortBy, setSortBy] = useState("");
  const [fetchError, setFetchError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setFetchError("");
      const apiUrl = APIHOST || "http://localhost:7034";
      const response = await axios.get(`${apiUrl}/api/admin/students`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          ...appliedFilters,
          ...(sortBy ? { sortBy } : {}),
        },
      });
      setStudents(response.data.students || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching students:", error);
      setFetchError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load students. Restart the backend server if you recently added this feature."
      );
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, itemsPerPage, appliedFilters, sortBy]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 px-4 mt-6 mb-3 items-center text-sm">
        <input
          placeholder="Name"
          className="border p-1 rounded"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Institute ID"
          className="border p-1 rounded"
          value={filters.instituteId}
          onChange={(e) => setFilters({ ...filters, instituteId: e.target.value })}
        />
        <input
          placeholder="Graduation Year"
          className="border p-1 rounded"
          value={filters.graduationYear}
          onChange={(e) => setFilters({ ...filters, graduationYear: e.target.value })}
        />
        <input
          placeholder="Branch"
          className="border p-1 rounded"
          value={filters.branch}
          onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
        />
        <button
          onClick={() => {
            setAppliedFilters(
              Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""))
            );
            setCurrentPage(1);
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded-full hover:opacity-80"
        >
          Search
        </button>
        <button
          onClick={() => {
            setFilters({ name: "", instituteId: "", graduationYear: "", branch: "" });
            setAppliedFilters({});
            setSortBy("");
            setCurrentPage(1);
          }}
          className="px-3 py-1 text-black rounded-full bg-gray-200 hover:opacity-80"
        >
          Reset
        </button>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-1 rounded"
        >
          <option value="">Sort: Default</option>
          <option value="mostReferrals">Most Referrals</option>
          <option value="mostAccepted">Most Accepted</option>
          <option value="mostRejected">Most Rejected</option>
        </select>
      </div>

      <div className="flex items-center">
        <div className="text-sm flex items-center">
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mx-2 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <p>Page {currentPage} of {totalPages}</p>
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mx-2 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        <div className="flex px-4 text-sm items-center gap-2 mb-2">
          <label htmlFor="studentItemsPerPage">Rows per page:</label>
          <select
            id="studentItemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border p-1 rounded"
          >
            {[10, 20, 30, 50].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-scroll px-4">
        <div className="mt-5 mb-1 ml-[20px] flex text-sm font-medium">
          <p className="min-w-[120px] max-w-[120px]">Name</p>
          <p className="min-w-[100px] max-w-[100px]">Institute Id</p>
          <p className="min-w-[140px] max-w-[140px]">Personal Email</p>
          <p className="min-w-[60px] max-w-[60px]">Branch</p>
          <p className="min-w-[60px] max-w-[60px]">Grad. Yr</p>
          <p className="min-w-[120px] max-w-[120px]">LinkedIn</p>
          <p className="min-w-[70px] max-w-[70px]">Total Sent</p>
          <p className="min-w-[70px] max-w-[70px]">Accepted</p>
          <p className="min-w-[70px] max-w-[70px]">Rejected</p>
        </div>

        {fetchError && (
          <p className="text-red-600 text-sm px-4 mb-3">{fetchError}</p>
        )}

        <div className={loading ? "opacity-70" : "opacity-100"}>
          {loading ? (
            <div className="border mx-auto p-6 flex items-center justify-center h-[300px] rounded-2xl w-[80vw] border-2 border-white-100 bg-gray-200">
              <p className="text-center">Wait... Loading Student List...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="border mx-auto p-6 flex items-center justify-center h-[200px] rounded-2xl w-[80vw] bg-gray-100">
              <p className="text-center text-gray-600">No students found. Register a student account or run the seed script.</p>
            </div>
          ) : (
            students.map((student) => (
              <div key={student._id} className="flex items-center text-sm">
                <p className="min-w-[120px] max-w-[120px] p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] line-clamp-1">
                  {student.name}
                </p>
                <p className="min-w-[100px] max-w-[100px] p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]">
                  {student.instituteId}
                </p>
                <p className="min-w-[140px] max-w-[140px] p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] line-clamp-1">
                  {student.personalEmail}
                </p>
                <p className="min-w-[60px] max-w-[60px] p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]">
                  {student.branch}
                </p>
                <p className="min-w-[60px] max-w-[60px] p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]">
                  {student.graduationYear}
                </p>
                <p className="min-w-[120px] max-w-[120px] p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] line-clamp-1 overflow-hidden">
                  {student.linkedin || "—"}
                </p>
                <p className="min-w-[70px] max-w-[70px] p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] text-center">
                  {student.totalReferralRequestsSent ?? 0}
                </p>
                <p className="min-w-[70px] max-w-[70px] p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] text-center">
                  {student.referralStats?.accepted ?? 0}
                </p>
                <p className="min-w-[70px] max-w-[70px] p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] text-center">
                  {student.referralStats?.rejected ?? 0}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminStudentsPage() {
  const navigate = useNavigate();
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
        alert(res.data.message);
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

  if (loading) return <div className="p-4">Loading...</div>;

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
          <Link to="/admin">Back to Admin Panel</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      <div className="p-3 px-4 bg-white flex items-center gap-5">
        <img src={Logo} alt="iiit kota logo" className="h-[60px]" />
        <h1 className="text-2xl font-medium">Student Management — IIIT Kota Alumni Portal</h1>
      </div>

      <div className="flex bg-white border-t-2 flex-wrap gap-1 gap-y-4 p-4">
        <TabButton label="Alumni" isActive={false} onClick={() => navigate("/admin")} />
        <TabButton label="Students" isActive={true} onClick={() => {}} />
        <TabButton label="Blogs" isActive={false} onClick={() => navigate("/admin/blogs")} />
        <TabButton label="News" isActive={false} onClick={() => navigate("/admin")} />
        <TabButton label="Events" isActive={false} onClick={() => navigate("/admin")} />
        <div className="ml-auto flex gap-2 items-center mr-3">
          <button
            className="flex items-center bg-red-500 text-white hover:opacity-80 px-4 py-2 font-semibold rounded-[22px]"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>

      <StudentList />
    </div>
  );
}
