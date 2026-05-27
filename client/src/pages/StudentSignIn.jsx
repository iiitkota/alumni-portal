import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/iiitkotalogo.png";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function StudentSignIn() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    instituteId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'instituteId' ? value.toLowerCase() : value;
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.instituteId || !formData.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const apiHost = import.meta.env.VITE_API_URL || "http://localhost:7034";
      const response = await axios.post(
        `${apiHost}/api/student/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      login(response.data.token);
      toast.success("Student Sign-in Successful");

      setTimeout(() => {
        navigate('/referrals');
      }, 1500);
      
    } catch (error) {
      console.error("Student sign-in error:", error);
      setLoading(false);
      toast.error(error.response?.data?.message || "Sign-in Failed");
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#1A1C4E]">
      <div><Toaster position="top-right"/></div>
      <div className="md:w-[85%] md:h-auto w-[95%] h-auto max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <img 
            src={Logo} 
            className="w-3/5 cursor-pointer" 
            alt="Logo" 
            onClick={() => navigate('/')}
          />
        </div>
        <h2 className="text-3xl font-semibold text-center text-[#32325D] mb-6">
          Student Sign In
        </h2>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center">
            <input
              type="text"
              name="instituteId"
              value={formData.instituteId}
              onChange={handleChange}
              placeholder="Institute ID (e.g. 2024kucp2020)"
              required
              className="w-full px-4 py-3 border border-[#0E407C] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
            />
          </div>
          <div className="mb-6 flex items-center relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-4 py-3 border border-[#0E407C] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="w-full h-auto flex justify-center items-center">
            <button
              type="submit"
              className="px-4 py-3 bg-[#0E407C] hover:bg-[#19194D] text-white rounded-md shadow-xl w-full flex items-center justify-center transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-t-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mr-2" />{" "}
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center flex flex-col gap-2">
          <p className="text-gray-600 text-sm">
            New student?{" "}
            <span 
              className="text-blue-600 hover:underline cursor-pointer font-semibold"
              onClick={() => navigate('/student-signup')}
            >
              Register here
            </span>
          </p>
          <p className="text-gray-600 text-sm">
            Alumni?{" "}
            <span 
              className="text-[#0E407C] hover:underline cursor-pointer font-semibold"
              onClick={() => navigate('/signin')}
            >
              Sign In here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentSignIn;
