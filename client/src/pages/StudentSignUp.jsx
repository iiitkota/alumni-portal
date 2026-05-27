import { useState } from "react";
import Logo from "../assets/iiitkotalogo.png";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import ComputerIcon from "@mui/icons-material/Computer";
import EmailIcon from "@mui/icons-material/Email";
import CallIcon from "@mui/icons-material/Call";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const StudentSignUp = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    instituteId: "",
    branch: "",
    personalEmail: "",
    phoneNumber: "",
    graduationYear: "",
    currentYear: "",
    linkedin: "",
    password: "",
    confirmPassword: ""
  });

  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "instituteId" ? value.toLowerCase() : value
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.personalEmail.endsWith("@iiitkota.ac.in")) {
      const errMsg = "Only institute emails (@iiitkota.ac.in) are allowed.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const errMsg = "Passwords do not match.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:7034";
      const response = await axios.post(`${apiUrl}/api/student/register`, {
        name: formData.name,
        instituteId: formData.instituteId,
        branch: formData.branch,
        personalEmail: formData.personalEmail,
        phoneNumber: formData.phoneNumber,
        graduationYear: formData.graduationYear,
        currentYear: Number(formData.currentYear),
        linkedin: formData.linkedin,
        password: formData.password
      });

      toast.success(response.data.message || "Registration initiated. OTP sent.");
      setStep(2);
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong during registration.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (otp.length !== 6 || isNaN(Number(otp))) {
      const errMsg = "Please enter a valid 6-digit OTP.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:7034";
      const response = await axios.post(`${apiUrl}/api/student/verify-otp`, {
        personalEmail: formData.personalEmail,
        otp
      });

      toast.success("Email verified successfully!");
      login(response.data.token);
      navigate("/referrals");
    } catch (error) {
      const msg = error.response?.data?.message || "OTP verification failed.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:7034";
      const response = await axios.post(`${apiUrl}/api/student/register`, {
        name: formData.name,
        instituteId: formData.instituteId,
        branch: formData.branch,
        personalEmail: formData.personalEmail,
        phoneNumber: formData.phoneNumber,
        graduationYear: formData.graduationYear,
        currentYear: Number(formData.currentYear),
        linkedin: formData.linkedin,
        password: formData.password
      });

      toast.success(response.data.message || "OTP resent successfully.");
    } catch (error) {
      const msg = error.response?.data?.message || "Resending OTP failed.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen py-8 bg-[#1A1C4E] flex justify-center items-center">
      <Toaster position="top-right" />
      <div className="w-[95%] md:w-[85%] max-w-7xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row">
        {/* Left column */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center bg-gradient-to-br from-[#0E407C] to-[#19194D] rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
          <img
            src={Logo}
            className="w-1/2 mb-6 cursor-pointer"
            alt="IIIT Kota Logo"
            onClick={() => navigate("/")}
          />
          <p className="text-white text-center">
            Already have an account?{" "}
            <Link to="/student-signin" className="text-blue-300 hover:underline">
              Sign In here
            </Link>
          </p>
        </div>

        {/* Right column */}
        <div className="w-full md:w-1/2 p-8">
          {step === 1 ? (
            <form onSubmit={handleRegisterSubmit} className="w-full h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#19194D] mb-6 text-center md:text-start">
                  Student Sign Up
                </h2>
                
                {/* Full Name */}
                <div className="mb-4 w-full flex items-center max-md:justify-center">
                  <PersonIcon className="mr-2 text-[#19194D]" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name*"
                    required
                    className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
                  />
                </div>

                {/* Institute ID */}
                <div className="mb-4 w-full flex items-center max-md:justify-center">
                  <LockIcon className="mr-2 text-[#19194D]" />
                  <input
                    type="text"
                    name="instituteId"
                    value={formData.instituteId}
                    onChange={handleChange}
                    placeholder="Institute ID*"
                    required
                    className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
                  />
                </div>

                {/* Branch */}
                <div className="mb-4 w-full flex items-center max-md:justify-center">
                  <ComputerIcon className="mr-2 text-[#19194D]" />
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
                  >
                    <option value="" disabled>Select your Branch*</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>

                {/* Personal Email */}
                <div className="mb-4 w-full flex items-center max-md:justify-center">
                  <EmailIcon className="mr-2 text-[#19194D]" />
                  <input
                    type="email"
                    name="personalEmail"
                    value={formData.personalEmail}
                    onChange={handleChange}
                    placeholder="Personal Email ID*"
                    required
                    className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
                  />
                </div>

                {/* Phone Number */}
                <div className="mb-4 w-full flex items-center max-md:justify-center">
                  <CallIcon className="mr-2 text-[#19194D]" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Contact Number*"
                    required
                    className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
                  />
                </div>

                {/* Graduation Year */}
                <div className="mb-4 w-full flex items-center max-md:justify-center">
                  <PermContactCalendarIcon className="mr-2 text-[#19194D]" />
                  <select
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    required
                    className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
                  >
                    <option value="" disabled>Select Graduation Year*</option>
                    {Array.from({ length: 7 }, (_, i) => 2026 + i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Current Year */}
                <div className="mb-4 w-full flex items-center max-md:justify-center">
                  <PermContactCalendarIcon className="mr-2 text-[#19194D]" />
                  <select
                    name="currentYear"
                    value={formData.currentYear}
                    onChange={handleChange}
                    required
                    className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
                  >
                    <option value="" disabled>Select Current Year (1-4)*</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                {/* LinkedIn URL */}
                <div className="mb-4 w-full flex items-center max-md:justify-center">
                  <LinkedInIcon className="mr-2 text-[#19194D]" />
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="LinkedIn URL"
                    className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
                  />
                </div>

                {/* Password */}
                <div className="mb-4 w-full flex items-center max-md:justify-center">
                  <VpnKeyIcon className="mr-2 text-[#19194D]" />
                  <div className="w-full md:w-4/5 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Set Password*"
                      required
                      className="w-full px-4 py-3 pr-10 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
                    />
                    <div
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOffIcon className="text-[#0E407C]" /> : <VisibilityIcon className="text-[#0E407C]" />}
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-4 w-full flex items-center max-md:justify-center">
                  <VpnKeyIcon className="mr-2 text-[#19194D]" />
                  <div className="w-full md:w-4/5 relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password*"
                      required
                      className="w-full px-4 py-3 pr-10 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
                    />
                    <div
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <VisibilityOffIcon className="text-[#0E407C]" /> : <VisibilityIcon className="text-[#0E407C]" />}
                    </div>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-500 text-sm mb-4 md:w-4/5 ml-10">
                  {errorMsg}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#0E407C] text-white rounded-lg hover:bg-[#19194D] transition-colors flex items-center justify-center min-w-[120px] ml-auto"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-t-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpSubmit} className="w-full h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#19194D] mb-6 text-center md:text-start">
                  Email Verification
                </h2>
                <p className="text-gray-600 mb-6 text-center md:text-start">
                  An OTP has been sent to your institute email: <strong className="text-[#19194D]">{formData.personalEmail}</strong>
                </p>

                {/* OTP Input */}
                <div className="mb-6 w-full flex items-center max-md:justify-center">
                  <VpnKeyIcon className="mr-2 text-[#19194D]" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP*"
                    required
                    maxLength={6}
                    className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
                  />
                </div>

                <div className="flex gap-4 md:w-4/5 ml-8 max-md:justify-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-500 text-sm mb-4 md:w-4/5 ml-8">
                  {errorMsg}
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#0E407C] text-white rounded-lg hover:bg-[#19194D] transition-colors flex items-center justify-center min-w-[120px] ml-auto"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-t-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSignUp;
