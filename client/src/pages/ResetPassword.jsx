import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

function ResetPassword() {
  const { token } = useParams(); // Get the token from the URL
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        // `http://localhost:5000/api/password/reset-password/${token}`,
        `https://alumni-api.iiitkota.ac.in/api/password/reset-password/${token}`,
        { password },
        { headers: { "Content-Type": "application/json" } }
      );

      setLoading(false);
      toast.success("Password reset successful!");
      setTimeout(() => {
        navigate('/signin');
      }, 3000); // Redirect to sign-in page after 3 seconds

    } catch (error) {
      console.error("Error resetting password:", error);
      setLoading(false);
      toast.error("Failed to reset password.");
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#1A1C4E]">
      <div><Toaster position="top-right"/></div>
      <div className="md:w-[85%] h-auto w-[95%] max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-semibold text-center text-[#32325D] mb-6">
          Reset Password
        </h2>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center">
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              className="w-full px-4 py-3 border border-[#0E407C] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
            />
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
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
