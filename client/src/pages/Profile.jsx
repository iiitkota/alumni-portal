import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SignInPrompt from "./SignInPrompt.jsx";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/Footer.jsx";
import Avatar from "../assets/avatar.png";
import toast, { Toaster } from 'react-hot-toast';

let APIHOST = import.meta.env.VITE_API_URL


import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Contacts as ContactsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LinkedIn as LinkedInIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  EmojiEvents as EmojiEventsIcon,
  Share as Share,
  Delete as DeleteIcon,
  RemoveRedEye as EyeIcon
} from "@mui/icons-material";


// Map of graduation years → WhatsApp group links
const whatsappGroups = {
  2017: "https://chat.whatsapp.com/2017-group-link",
  2018: "https://chat.whatsapp.com/2018-group-link",
  2019: "https://chat.whatsapp.com/2019-group-link",
  2020: "https://chat.whatsapp.com/2020-group-link",
  2021: "https://chat.whatsapp.com/2021-group-link",
  2022: "https://chat.whatsapp.com/2022-group-link",
  2023: "https://chat.whatsapp.com/2023-group-link",
  2024: "https://chat.whatsapp.com/2024-group-link",
  2025: "https://chat.whatsapp.com/2025-group-link",
  2026: "https://chat.whatsapp.com/2025-group-link",

};

const Profile = () => {

  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(true); // opens on load

  const closeWhatsappModal = () => setIsWhatsappModalOpen(false);

  const { id } = useParams();
  const [phoneVisible, setphoneVisible] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    instituteId: "",
    branch: "",
    city: "",
    state: "",
    country: "",
    pastCompanies: "",
    currentCompany: "",
    personalEmail: "",
    phoneNumber: "",
    graduationYear: "",
    linkedin: "",
    achievements: "",
    profilePicture: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteProfilePictureModalOpen, setIsDeleteProfilePictureModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      let decodedToken;
      try {
        decodedToken = jwtDecode(token);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        navigate("/signin");
        return;
      }

      // Ensure the token contains both the user's id and institute id
      if (!decodedToken.id || !decodedToken.instituteId) {
        console.error("Token missing required fields");
        localStorage.removeItem("token");
        navigate("/signin");
        return;
      }

      const userIdFromToken = decodedToken.id;

      // If the route param id matches the token's id, redirect to /profile/me
      if (id === userIdFromToken) {
        navigate("/profile/me");
        return;
      }



      const fetchUser = async () => {
        try {
          const endpoint = id === "me" ? `/profile/me` : `/profile/${id}`;
          console.log(id)
          const response = await axios.get(
            `${APIHOST}/api${endpoint}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUser(response.data);
          setLoading(false);

        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      };

      fetchUser();


    } else {
      setLoading(false);
    }
  }, [id, token, navigate]);

  const fetchPref = async (instituteId) => {
    try {
      const response = await axios.get(
        `${APIHOST}/api/profile/preference`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { instituteId }
        }
      );

      console.log("here is the new req:", user)
      console.log(response.data.data.phoneVisible)

      setphoneVisible(response.data.data.phoneVisible)

    } catch (error) {
      console.log(error, "sdsdsdsd")
    }
  }

  const ChangeVisibility = async (visible) => {
    try {
      const response = await axios.post(
        `${APIHOST}/api/profile/preference`,
        {
          instituteId: user.instituteId,
          phoneVisible: visible
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }

      )

      console.log(response.data)

      setphoneVisible(prev => !prev)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (user && user.instituteId) {
      fetchPref(user.instituteId);
    }
  }, [user]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openShareModal = () => setIsShareModalOpen(true);
  const closeShareModal = () => setIsShareModalOpen(false);

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const openDeleteProfilePictureModal = () => setIsDeleteProfilePictureModalOpen(true);
  const closeDeleteProfilePictureModal = () => setIsDeleteProfilePictureModalOpen(false);

  const profileUrl = `${window.location.origin}/profile/${user._id}`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update the form data
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));

    // If the instituteId field is being updated
    if (name === "instituteId") {
      // Extract the year and branch from the instituteId
      const startYear = value.substring(0, 4); // First 4 digits represent the start year
      const branchCode = value.substring(4, 8); // Next 4 characters represent the branch code (kucp or kuec)

      // Determine the branch based on the branch code
      let branch = "";
      if (branchCode === "kucp") {
        branch = "CSE";
      } else if (branchCode === "kuec") {
        branch = "ECE";
      }

      // Calculate the graduation year (4 years after the start year)
      const graduationYear = parseInt(startYear) + 4;

      // Update the branch and graduationYear fields
      setUser((prevUser) => ({
        ...prevUser,
        branch: branch,
        graduationYear: graduationYear.toString(),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('branch', user.branch);
      formData.append('city', user.city);
      formData.append('state', user.state);
      formData.append('country', user.country);
      formData.append('pastCompanies', user.pastCompanies);
      formData.append('currentCompany', user.currentCompany);
      formData.append('personalEmail', user.personalEmail);
      formData.append('phoneNumber', user.phoneNumber);
      formData.append('graduationYear', user.graduationYear);
      formData.append('linkedin', user.linkedin);
      formData.append('achievements', user.achievements);
      formData.append('role', user.role); // Added role field

      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }

      const response = await axios.put(
        "https://alumni-api.iiitkota.ac.in/api/profile/me",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUser(response.data);
      closeModal();
      toast.success('Profile updated successfully!');
    } catch (error) {
      setError(error.message);
      toast.error('Failed to update profile.');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDeleteProfilePicture = async () => {
    try {
      await axios.delete(
        "https://alumni-api.iiitkota.ac.in/api/profile/me/profilePicture",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser({ ...user, profilePicture: null });
      closeDeleteProfilePictureModal();
      toast.success('Profile picture deleted successfully!');
    } catch (error) {
      setError(error.message);
      toast.error('Failed to delete profile picture.');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await axios.delete(
        "https://alumni-api.iiitkota.ac.in/api/profile/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      localStorage.removeItem("token");
      navigate("/signin");
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading)
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          <p className="text-gray-700 mt-4">Loading...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="text-red-500 text-4xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <p className="text-red-500 text-lg">Error: {error}</p>
        </div>
      </div>
    );

  if (!token) {
    return <SignInPrompt />;
  }

  return (
    <div className="w-full h-full overflow-x-hidden custom-scrollbar bg-gray-100">
      <Toaster position="top-right" />
      <Navbar />

      {isWhatsappModalOpen && <div className="fixed bottom-5 max-w-[280px] right-5 z-20 bg-green-500 p-5 pt-2 rounded-xl" >
        <button className="p-1 rounded-xl text-white px-4  text-sm mx-auto block mt-2 bg-[#ffffff2b]" onClick={() => setIsWhatsappModalOpen(false)}>close</button>
        <img className="mt-4 rounded-xl" src="https://cdn.aptoide.com/imgs/c/7/6/c7644008f58970f3d495d2d68958652a_fgraphic.png" alt="" />

        <h1 className="font-medium mt-4 text-xl text-center text-white" >Join {user.graduationYear} Batch WhatsApp Community Now</h1>

        <div className="flex justify-center gap-2">
          <a className="p-2 rounded-2xl  px-4 inline-block mt-2 bg-white " href={`${whatsappGroups[user.graduationYear]}`}>Join Now</a>




        </div>
      </div>}


      {/* Edit Profile Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} fullWidth maxWidth="md">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <TextField
              margin="dense"
              label="Name"
              name="name"
              value={user.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Institute ID"
              name="instituteId"
              value={user.instituteId}
              onChange={handleChange}
              disabled
              fullWidth
            />
            <TextField
              margin="dense"
              label="Branch"
              name="branch"
              value={user.branch}
              onChange={handleChange}
              fullWidth
              disabled
              InputProps={{
                style: {
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                },
              }}
            />
            <TextField
              margin="dense"
              label="Graduation Year"
              name="graduationYear"
              value={user.graduationYear}
              onChange={handleChange}
              fullWidth
              disabled
              InputProps={{
                style: {
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                },
              }}
            />
            <TextField
              margin="dense"
              label="City"
              name="city"
              value={user.city}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="State"
              name="state"
              value={user.state}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Country"
              name="country"
              value={user.country}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Past Companies"
              name="pastCompanies"
              value={user.pastCompanies}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Current Company"
              name="currentCompany"
              value={user.currentCompany}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Email ID"
              name="personalEmail"
              value={user.personalEmail}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Phone Number"
              name="phoneNumber"
              value={user.phoneNumber}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="LinkedIn"
              name="linkedin"
              value={user.linkedin}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Achievements"
              name="achievements"
              value={user.achievements}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              margin="dense"
              label="Role"
              name="role"
              value={user.role}
              onChange={handleChange}
              fullWidth
            />
            <div>
              <label htmlFor="profilePictureUpload" className="block text-sm font-medium text-gray-700">
                Upload Profile Picture
              </label>
              <input
                type="file"
                id="profilePictureUpload"
                name="profilePictureUpload"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
              />
            </div>
            {user.profilePicture && (
              <div>
                <Button
                  onClick={openDeleteProfilePictureModal}
                  color="secondary"
                  style={{ backgroundColor: "#f44336", color: "#fff" }}
                  fullWidth
                >
                  Delete Profile Picture
                </Button>
              </div>
            )}
            <div>
              <Button
                onClick={openDeleteModal}
                color="secondary"
                style={{ backgroundColor: "#f44336", color: "#fff" }}
                fullWidth
              >
                Delete Profile
              </Button>
            </div>
          </form>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={closeModal} color="primary" style={{ backgroundColor: "#9e9e9e", color: "#fff" }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" style={{ backgroundColor: "#2196f3", color: "#fff" }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Profile Modal */}
      <Dialog open={isShareModalOpen} onClose={closeShareModal} fullWidth maxWidth="md">
        <DialogTitle>Share Profile</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Profile URL"
            value={profileUrl}
            fullWidth
            InputProps={{
              readOnly: true,
              style: {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeShareModal} color="primary" style={{ backgroundColor: "#9e9e9e", color: "#fff" }}>
            Close
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(profileUrl);
              closeShareModal();
            }}
            color="primary"
            style={{ backgroundColor: "#2196f3", color: "#fff" }}
          >
            Copy URL
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Profile Modal */}
      <Dialog open={isDeleteModalOpen} onClose={closeDeleteModal} fullWidth maxWidth="md">
        <DialogTitle>Delete Profile</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete your profile? This action is irreversible.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteModal} color="primary" style={{ backgroundColor: "#9e9e9e", color: "#fff" }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteProfile} color="secondary" style={{ backgroundColor: "#f44336", color: "#fff" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Profile Picture Modal */}
      <Dialog open={isDeleteProfilePictureModalOpen} onClose={closeDeleteProfilePictureModal} fullWidth maxWidth="md">
        <DialogTitle>Delete Profile Picture</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete your profile picture? This action cannot be undone.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteProfilePictureModal} color="primary" style={{ backgroundColor: "#9e9e9e", color: "#fff" }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteProfilePicture} color="secondary" style={{ backgroundColor: "#f44336", color: "#fff" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Content */}
      <div className="w-full h-[35rem] md:h-72 mt-28 md:mt-36 lg:mt-36 px-6 md:px-20 flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3 md:h-full h-1/2 w-full rounded-lg shadow-xl bg-white flex flex-col gap-2 relative">
          {id === "me" && (
            <div className="absolute top-2 right-2 flex gap-2">
              <div
                className="w-8 h-8 rounded-full shadow-xl hover:cursor-pointer hover:rotate-90 transition-transform duration-300 ease-in-out flex justify-center items-center text-white bg-blue-900"
                onClick={openModal}
              >
                <SettingsIcon />
              </div>
              <div
                className="w-8 h-8 rounded-full shadow-xl hover:cursor-pointer transition-transform duration-300 ease-in-out flex justify-center items-center text-white bg-blue-900"
                onClick={openShareModal}
              >
                <Share />
              </div>
            </div>
          )}
          <div className="w-full h-[70%] flex justify-center items-center">
            <div className="md:w-40 md:h-40 w-32 h-32 rounded-full border border-gray-100 shadow-2xl overflow-hidden">
              <img
                src={user.profilePicture ? user.profilePicture : Avatar}
                className="w-full h-full object-cover"
                alt="profile picture"
              />
            </div>
          </div>

          <div className="w-full h-[30%] flex flex-col overflow-scroll scrollbar-hide">
            <div className="w-full h-1/2">
              <p className="w-full h-full flex justify-center items-center text-center text-md md:text-xl text-blue-950">
                {user.name} • {user.instituteId}
              </p>
            </div>
            <div className="w-full h-1/2">
              <p className="w-full h-full flex justify-center items-center text-sm md:text-md text-blue-950">
                Batch of {user.graduationYear} • {user.branch}
              </p>
            </div>
          </div>
        </div>
        <div className="md:w-2/3 md:h-full h-2/3 w-full shadow-xl rounded-xl bg-white flex flex-col">
          <div className="w-full h-[20%] border-b border-blue-950 p-2 flex items-center gap-4 text-blue-950 font-semibold text-lg md:text-2xl">
            <PersonIcon /> IIIT Kota Related Experience
          </div>
          <div className="w-full h-[80%] flex justify-center items-center overflow-scroll scrollbar-hide">
            <div className="w-5/6 h-3/4 flex flex-col gap-2 text-blue-950 text-md md:text-lg">
              <p className="w-full mb-2 md:mb-4 font-semibold text-lg md:text-xl">
                Alumni
              </p>
              <p className="w-full">{user.instituteId}</p>
              <p className="w-full">
                Bachelor's in Technology, {user.branch === 'CSE' ? 'Computer Science and Engineering' : 'Electronics and Communication Engineering'}
              </p>
              <p className="w-full">
                {user.graduationYear - 4} - {user.graduationYear}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-[60rem] md:h-72 mt-2 flex md:flex-row flex-col gap-3 px-6 md:px-20 mb-16">
        <div className="md:w-1/3 md:h-full w-full h-1/3 rounded-xl shadow-2xl bg-white flex flex-col">
          <div className="w-full h-[20%] border-b border-blue-950 p-2 flex items-center gap-4 text-blue-950 font-semibold text-lg md:text-2xl">
            <ContactsIcon /> Contact Information
          </div>
          <div className="w-full h-[80%] md:p-4 p-2 flex flex-col justify-center gap-4 text-blue-950 overflow-scroll scrollbar-hide">
            <div className="h-[2rem] w-full flex gap-2">
              <EmailIcon />
              <a href={`mailto:${user.personalEmail}`} className="truncate">{user.personalEmail}</a>
            </div>
            <div className={` ${id != "me" && phoneVisible == false ? "hidden" : ''} h-[2rem] w-full flex gap-2`}>

              {
                id == "me" ?

                  <div className="flex items-center gap-4" >
                    <div className="flex gap-1" >
                      <PhoneIcon />
                      <p>{user.phoneNumber}</p>
                    </div>
 
                  

                   <div className="flex gap-1" >  <EyeIcon />Visibility:
                     <button onClick={() => ChangeVisibility(!phoneVisible)} className="flex  underline items-center gap-1"  >
                    

                      {phoneVisible == true ? "Public" : "Private"}

                    </button>
                   </div>

                  </div>

                  :


                  <div>

                    {phoneVisible == false ? '' : <div className="flex gap-2" > <PhoneIcon />
                      <p>{user.phoneNumber}</p> </div>}


                  </div>
              }


            </div>
            <div className="h-[2rem] w-full flex gap-2">
              <HomeIcon />
              <p className="truncate">
                {user.city}, {user.state}, {user.country}
              </p>
            </div>
            <div className="h-[2rem] w-full flex gap-2">
              <LinkedInIcon />
              <a href={user.linkedin} target="_blank" className="truncate">
                {user.linkedin}
              </a>
            </div>
          </div>
        </div>
        <div className="md:w-1/3 md:h-full w-full h-1/3 rounded-xl shadow-2xl bg-white flex flex-col">
          <div className="w-full h-[20%] border-b border-blue-950 p-2 flex items-center gap-4 text-blue-950 font-semibold text-2xl">
            <WorkIcon /> Work Information
          </div>
          <div className="w-full h-[80%] p-4 flex flex-col gap-4 text-blue-950 overflow-scroll scrollbar-hide">
            <div className="h-[2rem] w-full flex gap-2">
              <BusinessIcon />
              <p>
                <span className="font-semibold">{user.role}</span>{" "}
                - <span className="font-semibold">{user.currentCompany}</span>
              </p>
            </div>
            <div className="h-[2rem] w-full gap-2 flex justify-start items-center">
              <p className="underline font-semibold">
                Past Companies / Institutes
              </p>
            </div>
            <div className="h-[2rem] w-full flex gap-2">
              <BusinessIcon />
              <p>{user.pastCompanies && user.pastCompanies.trim() !== "" ? user.pastCompanies : 'none'}</p>
            </div>
          </div>
        </div>
        <div className="md:w-1/3 md:h-full w-full h-1/3 rounded-xl shadow-2xl bg-white flex flex-col">
          <div className="w-full h-[20%] border-b border-blue-950 p-2 flex items-center gap-4 text-blue-950 font-semibold text-2xl">
            <EmojiEventsIcon /> Achievements
          </div>
          <div className="w-full h-[80%] p-4 flex flex-col gap-4 text-blue-950 overflow-scroll scrollbar-hide">
            {user.achievements && user.achievements.trim() !== "" ? user.achievements : "None yet"}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
