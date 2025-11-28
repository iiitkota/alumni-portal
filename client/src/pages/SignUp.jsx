import { useState } from "react";
import Logo from "../assets/iiitkotalogo.png";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import ComputerIcon from "@mui/icons-material/Computer";
import EmailIcon from "@mui/icons-material/Email";
import CallIcon from "@mui/icons-material/Call";
import HouseIcon from "@mui/icons-material/House";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import BusinessIcon from "@mui/icons-material/Business";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PublicIcon from "@mui/icons-material/Public";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EmailVerification from '../components/EmailVerification';

const SignUp = () => {
  const [currentDiv, setCurrentDiv] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const [formData, setFormData] = useState({
    name: "",
    instituteId: "",
    branch: "",
    personalEmail: "",
    phoneNumber: "",
    city: "",
    state: "",
    country: "",
    graduationYear: "",
    pastCompanies: "",
    currentCompany: "",
    role: "",
    linkedin: "",
    achievements: "",
    password: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert instituteId to lowercase, leave other fields unchanged
    const processedValue = name === 'instituteId' ? value.toLowerCase() : value;

    // Update the form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: processedValue,
    }));

    // If the instituteId field is being updated
    if (name === "instituteId") {
      // Extract the year and branch from the instituteId
      const year = processedValue.substring(0, 4); // First 4 digits represent the year
      const branchCode = processedValue.substring(4, 8); // Next 4 characters represent the branch code (kucp or kuec)

      // Determine the branch based on the branch code
      let branch = "";
      if (branchCode === "kucp") {
        branch = "CSE";
      } else if (branchCode === "kuec") {
        branch = "ECE";
      }

      // Calculate the graduation year (4 years after the start year)
      const startYear = parseInt(year);
      const graduationYear = startYear + 4;

      // Update the branch and graduationYear fields
      setFormData((prevFormData) => ({
        ...prevFormData,
        branch: branch,
        graduationYear: graduationYear.toString(),
      }));
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setSelectedFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "No file chosen");
  };

  const validateFormData = () => {
    const instituteIdRegex = /^\d{4}(kucp|kuec)\d{4}$/;

    if (!instituteIdRegex.test(formData.instituteId.toLowerCase())) {
      alert("Invalid institute ID format.");
      return false;
    }

    // if the user is passing out in 2026 or later, give him an alert message saying he cannot
    if (parseInt(formData.graduationYear) >= 2027) {
      alert("Registration is not allowed for students graduating in 2027 or later.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormData()) {
      return;
    }

    if (!isEmailVerified) {
      toast.error('Please verify your email before registration');
      return;
    }

    setLoading(true);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });

    if (selectedFile) {
      formDataObj.append("profilePicture", selectedFile);
    }

    try {
      const endpoint = isExistingUser
        ? "https://alumni-api.iiitkota.ac.in/api/profile/me"
        : "https://alumni-api.iiitkota.ac.in/api/auth/signup";

      // console.log('Submitting form with data:', {
      //   isExistingUser,
      //   isEmailVerified,
      //   instituteId: formData.instituteId
      // });

      const response = await axios({
        method: isExistingUser ? 'put' : 'post',
        url: endpoint,
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
          ...(isExistingUser && { Authorization: `Bearer ${localStorage.getItem('token')}` })
        },
      });

      setFormData({
        name: "",
        instituteId: "",
        branch: "",
        personalEmail: "",
        phoneNumber: "",
        city: "",
        state: "",
        country: "",
        graduationYear: "",
        pastCompanies: "",
        currentCompany: "",
        role: "",
        linkedin: "",
        achievements: "",
        password: "",
      });

      setSelectedFile(null);
      setFileName("No file chosen");
      setCurrentDiv(0);
      setLoading(false);
      setIsEmailVerified(false);
      setIsExistingUser(false);

      toast.success(isExistingUser ? "Profile updated successfully" : "Registration Successful");

      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      setLoading(false);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        if (error.response.data.details) {
          // console.log('Error details:', error.response.data.details);
        }
      } else {
        toast.error("There was an error. Please try again later.");
      }
    }
  };

  const handleLogoClick = () => {
    window.location.href = "https://alumni.iiitkota.ac.in";
  };

  const verificationDiv = (
    <div className="h-full w-full flex flex-col justify-center max-md:items-center">
      <h2 className="text-3xl text-center md:text-start font-bold text-[#19194D] mb-6">
        Email Verification <span className="text-sm text-gray-500">(Required)</span>
      </h2>
      <EmailVerification
        instituteId={formData.instituteId}
        personalEmail={formData.personalEmail}
        onVerificationComplete={(isExisting) => {
          setIsEmailVerified(true);
          setIsExistingUser(isExisting);
        }}
      />
    </div>
  );

  const divs = [
    // Page 1
    <div className="h-full w-full flex flex-col justify-center max-md:items-center">
      <h2 className="text-3xl text-center md:text-start font-bold text-[#19194D] mb-6">
        Alumni Details <span className="text-sm text-gray-500">(1/4)</span>
      </h2>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <PersonIcon className="mr-2 text-[#19194D]" />
        <input
          type="text"
          id="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name*"
          required
          className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
        />
      </div>
      <div className=" w-full flex   items-center max-md:justify-center">
        <LockIcon className="text-[#19194D] mr-2" />
        <input
          type="text"
          id="CollegeID"
          name="instituteId"
          value={formData.instituteId}
          onChange={handleChange}
          placeholder="Institute ID*"
          required
          className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
        />

      </div>
      <p className="ml-10 mt-1  text-sm mb-6">Please enter Student ID not Institute Email ID</p>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <ComputerIcon className="text-[#19194D] mr-2" />
        <select
          id="Branch"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          required
          disabled
          className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C] bg-gray-100 cursor-not-allowed"
        >
          <option value="" disabled>
            Select your Branch
          </option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
        </select>
      </div>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <PermContactCalendarIcon className="text-[#19194D] mr-2" />
        <select
          id="graduationYear"
          name="graduationYear"
          value={formData.graduationYear}
          onChange={handleChange}
          required
          disabled
          className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C] bg-gray-100 cursor-not-allowed"
        >
          <option value="" disabled>
            Select Graduation Year
          </option>
          {Array.from({ length: 15 }, (_, i) => 2017 + i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>,
    verificationDiv,
    // Page 2
    <div className="h-full w-full flex flex-col justify-center max-md:items-center">
      <h2 className="text-3xl text-center md:text-start font-bold text-[#19194D] mb-6">
        Alumni Details <span className="text-sm text-gray-500">(2/4)</span>
      </h2>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <EmailIcon className="text-[#19194D] mr-2" />
        <input
          type="email"
          id="PersonalEmail"
          name="personalEmail"
          value={formData.personalEmail}
          onChange={handleChange}
          placeholder="Personal Email ID*"
          required
          className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
        />
      </div>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <CallIcon className="text-[#19194D] mr-2" />
        <input
          type="tel"
          id="PhoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Contact Number*"
          required
          className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
        />
      </div>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <HouseIcon className="text-[#19194D] mr-2" />
        <div className="flex w-full gap-4">
          <input
            type="text"
            className="w-1/2 md:w-2/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
            id="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Current city / Town*"
            required
          />
          <input
            type="text"
            className="w-1/2 md:w-2/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
            id="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State*"
            required
          />
        </div>
      </div>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <PublicIcon className="text-[#19194D] mr-2" />
        <input
          type="text"
          className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
          id="Country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Country*"
          required
        />
      </div>
    </div>,
    // Page 3
    <div className="h-full w-full flex flex-col justify-center max-md:items-center">
      <h2 className="text-3xl text-center md:text-start font-bold text-[#19194D] mb-6">
        Alumni Details <span className="text-sm text-gray-500">(3/4)</span>
      </h2>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <BusinessIcon className="text-[#19194D] mr-2" />
        <input
          type="text"
          id="PastCompanies"
          name="pastCompanies"
          value={formData.pastCompanies}
          onChange={handleChange}
          placeholder="Past Companies / Institutes"
          className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
        />
      </div>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <BusinessIcon className="text-[#19194D] mr-2" />
        <input
          type="text"
          id="CurrentCompany"
          name="currentCompany"
          value={formData.currentCompany}
          onChange={handleChange}
          placeholder="Current Company / Institute*"
          required
          className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
        />
      </div>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <EngineeringIcon className="text-[#19194D] mr-2" />
        <input
          type="text"
          id="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          placeholder="Role / Degree*"
          required
          className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
        />
      </div>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <LinkedInIcon className="text-[#19194D] mr-2" />
        <input
          type="text"
          id="LinkedIn"
          name="linkedin"
          value={formData.linkedin}
          onChange={handleChange}
          placeholder="LinkedIn URL"
          className="w-full md:w-4/5 px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
        />
      </div>
    </div>,
    // Page 4
    <div className="h-full w-full flex flex-col justify-center max-md:items-center">
      <h2 className="text-3xl text-center md:text-start font-bold text-[#19194D] mb-6">
        Alumni Details <span className="text-sm text-gray-500">(4/4)</span>
      </h2>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <EmojiEventsIcon className="text-[#19194D] mr-2" />
        <textarea
          id="Achievements"
          name="achievements"
          value={formData.achievements}
          onChange={handleChange}
          placeholder="Achievements"
          className="w-full md:w-4/5 px-4 py-3 h-[7rem] resize-none border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
        />
      </div>
      <div className="mb-6 w-full flex items-center max-md:justify-center">
        <VpnKeyIcon className="text-[#19194D] mr-2" />
        <div className="w-full md:w-4/5 relative">
          <input
            type={showPassword ? "text" : "password"}
            id="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Set Password*"
            required
            className="w-full px-4 py-3 pr-10 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
          />
          <div
            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <VisibilityOffIcon className="text-[#0E407C]" />
            ) : (
              <VisibilityIcon className="text-[#0E407C]" />
            )}
          </div>
        </div>
      </div>
      <div className="w-full flex items-center max-md:justify-center">
        <AccountCircleIcon className="text-[#19194D] mr-2" />
        <div className="w-full md:w-4/5">
          <div className="relative">
            <input
              type="file"
              id="file-input"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-input"
              className="block w-full px-4 py-3 border border-[#0E407C] rounded-lg text-gray-400 cursor-pointer hover:bg-blue-50"
            >
              Recent Profile Picture
            </label>
          </div>
          <span className="block mt-2 text-sm text-gray-500">{fileName}</span>
        </div>
      </div>
    </div>,
  ];

  const nextDiv = () => {

    if (currentDiv == 0) {

      if (!formData.name.trim()) {
        toast.error('Please enter your name');
        return;
      }

      if (!validateFormData()) {
        return;
      }

      // if (!isEmailVerified) {
      //   toast.error('Please verify your email before registration');
      //   return;
      // }

    }


    if (currentDiv == 1) {
      if (!isEmailVerified) {
        toast.error('Please verify your email before registration');
        return;
      }
    }


    if (currentDiv == 2) {
      if (!formData.personalEmail.trim()) {
        toast.error('Please enter your Personal Email');
        return;
      }

      if (!formData.phoneNumber.trim()) {
        toast.error('Please enter your Contact Number');
        return;
      }

      if (!formData.city.trim()) {
        toast.error('Please enter your city');
        return;
      }

      if (!formData.state.trim()) {
        toast.error('Please enter your state');
        return;
      }


      if (!formData.country.trim()) {
        toast.error('Please enter your country');
        return;
      }


    }

    if (currentDiv == 3) {
      if (!formData.role.trim()) {
        toast.error('Please fill your role');
        return;
      }

      if (!formData.currentCompany.trim()) {
        toast.error('Please fill your current company');
        return;
      }


    }

    if (currentDiv < divs.length - 1) {
      setCurrentDiv(currentDiv + 1);
    }


  };

  const prevDiv = () => {
    if (currentDiv > 0) {
      setCurrentDiv(currentDiv - 1);
    }
  };

  return (
    <div className="w-screen min-h-screen py-8 bg-[#1A1C4E] flex justify-center items-center">
      <Toaster position="top-right" />
      <div className="w-[95%] md:w-[85%] max-w-7xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center bg-gradient-to-br from-[#0E407C] to-[#19194D] rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
          <img
            src={Logo}
            className="w-1/2 mb-6"
            alt="IIIT Kota Logo"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          />
          <p className="text-white text-center">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-300 hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
        <div className="w-full md:w-1/2 p-8">
          <form
            className="w-full h-full flex flex-col justify-between"
            onSubmit={handleSubmit}
          >
            {divs[currentDiv]}
            <div className="flex justify-between mt-8">
              {currentDiv > 0 && (
                <button
                  type="button"
                  onClick={prevDiv}
                  className="px-6 py-2 bg-[#0E407C] text-white rounded-lg hover:bg-[#19194D] transition-colors"
                >
                  Previous
                </button>
              )}
              {currentDiv < divs.length - 1 ? (
                <button
                  type="button"
                  onClick={nextDiv}
                  className="px-6 py-2 bg-[#0E407C] text-white rounded-lg hover:bg-[#19194D] transition-colors ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0E407C] text-white rounded-lg hover:bg-[#19194D] transition-colors ml-auto"
                  disabled={loading}
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
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
