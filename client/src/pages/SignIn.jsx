import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/iiitkotalogo.png";
import { toast, Toaster } from "react-hot-toast"; // Import from react-hot-toast
import axios from "axios";

let APIHOST = import.meta.env.VITE_API_URL


function SignIn() {
  const [formData, setFormData] = useState({
    instituteId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert instituteId to lowercase, leave other fields unchanged
    const processedValue = name === 'instituteId' ? value.toLowerCase() : value;
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormData()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${APIHOST}/api/auth/signin`, // Update with your API endpoint
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Store the JWT token in localStorage
      localStorage.setItem('token', response.data.token);

      // Reset the form data
      setFormData({
        instituteId: "",
        password: "",
      });

      setLoading(false);

      // Show success toast notification
      toast.success(response.data.message || "Sign-in Successful");

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000); // Delay of 3000ms (3 seconds)
      
    } catch (error) {
      console.error("There was an error signing in:", error);
      setLoading(false);
      toast.error(error.response?.data?.message || "Sign-in Failed");
    }
  };

  const validateFormData = () => {
    // Add form validation logic if needed
    return formData.instituteId && formData.password;
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
            onClick={() => navigate('/')} // Navigate to home page on click
          />
        </div>
        <h2 className="text-3xl font-semibold text-center text-[#32325D] mb-6">
          Sign In
        </h2>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center">
            <input
              type="text"
              name="instituteId"
              value={formData.instituteId}
              onChange={handleChange}
              placeholder="Institute ID (e.g. 2020kucp1077)"
              required
              className="w-full px-4 py-3 border border-[#0E407C] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
            />
          </div>
          <div className="mb-6 flex items-center relative">
            <input
              type={showPassword ? "text" : "password"} // Toggle input type based on state
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-4 py-3 border border-[#0E407C] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="text-right mb-4">
            <span 
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate('/forgot-password')}  // Navigate to Forgot Password page
            >
              Forgot Password?
            </span>
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
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <span 
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate('/signup')}
            >
              Sign up here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
