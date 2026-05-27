import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Logo from "../assets/iiitkotalogo.png";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import EventIcon from "@mui/icons-material/Event";
import FeedIcon from "@mui/icons-material/Feed";
import WorkIcon from "@mui/icons-material/Work";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import InboxIcon from "@mui/icons-material/Inbox";
import SendIcon from "@mui/icons-material/Send";
import Avatar from "../assets/avatar.png";
import TopLayer from "./topLayer.jsx";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const toggleMobileMenu = () => {
    setTimeout(() => {
      setIsMobileMenuOpen((prev) => {
        if (prev) {
          setActiveSubMenu(null);
        }
        return !prev;
      });
    }, 200);
  };

  const handleSubMenuToggle = (menu) => {
    setActiveSubMenu(activeSubMenu === menu ? null : menu);
  };

  const { user: authUser, token, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      const fetchUser = async () => {
        try {
          const APIHOST = import.meta.env.VITE_API_URL || "https://alumni-api.iiitkota.ac.in";
          let role = authUser?.role;
          if (!role && token) {
            try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const decoded = JSON.parse(window.atob(base64));
              role = decoded?.role;
            } catch (e) {}
          }
          const endpoint = role === 'student'
            ? `${APIHOST}/api/student/me`
            : `${APIHOST}/api/profile/me`;

          const response = await axios.get(
            endpoint,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUser(response.data);
        } catch (error) {
          if (error.response && error.response.status === 401) { 
            // console.log("Token expired or invalid. Logging out...");
            logout();
            setIsLoggedIn(false);
            setUser(null);
            window.location.reload();
          } else {
            setError(error.message);
          }
        }
      };
      fetchUser();
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [token, authUser, logout]);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    setIsLoggedIn(false);
    setUser(null);
    toggleMobileMenu();
    window.location.reload();
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="w-full h-auto fixed top-0 left-0 z-[20] shadow-md">
      <TopLayer />
      <div className="w-full h-[6.875rem] max-w-980:h-[90px] max-w-492:h-[70px] bg-white flex py-4">
        <div className="w-1/3 max-w-1464:w-[10%] max-w-980:w-[80%] h-full flex gap-2 items-center pl-2">
          <div className="w-auto h-full flex justify-center items-center">
            <button onClick={() => navigate("/")}>
              <img
                src={Logo}
                alt="iiit kota logo"
                className="w-[4.5rem] h-[4.5rem] max-w-980:w-[58px] max-w-980:h-[58px] max-w-492:h-[40px] max-w-492:w-[40px]"
              />
            </button>
          </div>
          <div className="w-auto h-full flex flex-col justify-center">
            <h6
              className="text-[12px] max-w-980:text-[9px] max-w-492:text-[7px] text-[#19194D] max-w-1464:hidden max-w-980:block"
              style={{ fontWeight: "700" }}
            >
              Alumni Cell
            </h6>
            <h6
              className="text-[12px] max-w-980:text-[9px] max-w-492:text-[7px] font-bold text-[#19194D] max-w-1464:hidden max-w-980:block"
              style={{ fontWeight: "1000" }}
            >
              Indian Institute of Information Technology, Kota
            </h6>
            <h6
              className="text-[12px] max-w-980:text-[9px] max-w-492:text-[7px] font-bold text-[#19194D] font-sans max-w-1464:hidden max-w-980:block"
              style={{ fontWeight: "1000" }}
            >
              (An Institute of National Importance under an Act of Parliament)
            </h6>
          </div>
        </div>
        <div
          className={`w-2/3 max-w-1464:w-[90%] max-w-980:w-[20%] h-full flex ${window.innerWidth <= 980
              ? "justify-center items-center"
              : "justify-end items-center pr-4"
            }`}
        >
          <div className="w-auto px-6 h-full flex relative group items-center text-[#19194D] max-w-980:hidden max-w-1464:ml-44">
            <button
              className="text-[0.9rem] font-sans hover:cursor-pointer"
              style={{ fontWeight: "400" }}
              onClick={() => navigate("/about")}
            >
              ABOUT US
            </button>
          </div>

          <div className="w-auto px-6 h-full relative group flex items-center text-[#19194D] max-w-980:hidden">
            <p
              className="text-[0.9rem] font-sans hover:cursor-pointer"
              style={{ fontWeight: "400" }}
            >
              ALUMNI ASSIST
            </p>
            <div className="rounded-md absolute top-12 opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 bg-white drop-shadow-2xl py-2 mt-2 w-[12rem] transition-all duration-300 ease-in-out transform translate-y-2">
              <ul className="w-full">
                <li className="hover:bg-gray-100 p-2">
                  <button onClick={() => navigate("/alumni/prominent-alumni")}>
                    Prominent Alumni
                  </button>
                </li>
                <li className="hover:bg-gray-100 p-2">
                  <button onClick={() => navigate("/alumni/gallery")}>
                    Alumni Gallery
                  </button>
                </li>
                <li className="hover:bg-gray-100 p-2">
                  <button onClick={() => navigate("/alumni/job-postings")}>
                    Jobs via Alumni
                  </button>
                </li>
                <li className="hover:bg-gray-100 p-2">
                  <button onClick={() => navigate("/alumni/contact")}>
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-auto px-6 h-full relative group flex items-center text-[#19194D] max-w-980:hidden">
            <button
              className="text-[0.9rem] font-sans hover:cursor-pointer"
              style={{ fontWeight: "400" }}
              onClick={() => navigate("/directory")}
            >
              DIRECTORY
            </button>
          </div>

          {isLoggedIn && authUser?.role === 'student' && (
            <div className="w-auto px-6 h-full relative group flex items-center text-[#19194D] max-w-980:hidden">
              <button
                className="text-[0.9rem] font-sans hover:cursor-pointer"
                style={{ fontWeight: "400" }}
                onClick={() => navigate("/referrals")}
              >
                REFERRALS
              </button>
            </div>
          )}

          {isLoggedIn && authUser?.role === 'alumni' && (
            <div className="w-auto px-6 h-full relative group flex items-center text-[#19194D] text-nowrap max-w-980:hidden">
              <button
                className="text-[0.9rem] font-sans hover:cursor-pointer"
                style={{ fontWeight: "400" }}
                onClick={() => navigate("/referral-inbox")}
              >
                REFERRAL INBOX
              </button>
            </div>
          )}

          <div className="w-auto px-6 h-full relative group flex items-center text-[#19194D] max-w-980:hidden">
            <button
              className="text-[0.9rem] font-sans hover:cursor-pointer"
              style={{ fontWeight: "400" }}
              onClick={() => navigate("/events")}
            >
              EVENTS
            </button>
          </div>

          <div className="w-auto px-6 h-full relative group flex items-center text-[#19194D] max-w-980:hidden">
            <button
              className="text-[0.9rem] font-sans hover:cursor-pointer"
              style={{ fontWeight: "400" }}
              onClick={() => navigate("/news")}
            >
              NEWS
            </button>
          </div>

          <div className="w-auto px-6 h-full relative group flex items-center text-[#19194D] max-w-980:hidden">
            <button
              className="text-[0.9rem] font-sans hover:cursor-pointer"
              style={{ fontWeight: "400" }}
              onClick={() => window.open("https://tpcell.iiitkota.ac.in/", "_blank")}
            >
              PLACEMENTS
            </button>
          </div>

          <div className="hidden w-full h-full text-[#19194D] max-w-980:flex max-w-980:justify-center max-w-980:items-center">
            <MenuIcon onClick={toggleMobileMenu} className="cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Mobile Menu Modal */}
      <div
        className={`fixed top-2 right-2 md:right-8 w-[96vw] md:w-[60vw] h-auto flex items-center justify-center transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className={`bg-white border-b-8 border-[#0E407C] shadow-2xl w-full h-full p-6 transition-opacity duration-300 transform ${isMobileMenuOpen ? "opacity-100" : "opacity-95"
            }`}
        >
          <div className="flex justify-between items-center border-b border-gray-200 text-[#172B4D] pb-4">
            <div className="w-auto h-auto flex gap-2 justify-start items-center">
              <button onClick={() => navigate("/")}>
                <img src={Logo} alt="home_page" className="w-10 h-10" />
              </button>
              <h3 className="text-lg font-semibold tracking-wide">MENU</h3>
            </div>
            <CloseIcon onClick={toggleMobileMenu} className="cursor-pointer" />
          </div>
          <div className="mt-4">
            <ul className="space-y-3">
              <li>
                <button
                  className="w-full text-left text-[#172B4D]"
                  onClick={() => {
                    navigate("/about");
                    toggleMobileMenu();
                  }}
                >
                  <div className="flex gap-3 items-center text-base font-medium">
                    <InfoIcon />
                    About Us
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSubMenuToggle("alumni")}
                  className="w-full text-left text-[#172B4D]"
                >
                  <div className="flex gap-3 items-center text-base font-medium">
                    <HelpIcon />
                    Alumni Assist
                    <span className="ml-auto">
                      {activeSubMenu === "alumni" ? "-" : "+"}
                    </span>
                  </div>
                </button>
                <div
                  className={`pl-6 overflow-hidden transition-max-height duration-300 ease-in-out ${activeSubMenu === "alumni" ? "max-h-48" : "max-h-0"
                    }`}
                >
                  <ul className="space-y-2 mt-2 text-sm font-normal border-l border-gray-200">
                    <li
                      className="py-2 pl-4 text-[#172B4D] hover:bg-gray-100 rounded"
                      onClick={() => {
                        navigate("/alumni/prominent-alumni");
                        toggleMobileMenu();
                      }}
                    >
                      Prominent Alumni
                    </li>
                    <li
                      className="py-2 pl-4 text-[#172B4D] hover:bg-gray-100 rounded"
                      onClick={() => {
                        navigate("/alumni/gallery");
                        toggleMobileMenu();
                      }}
                    >
                      Alumni Gallery
                    </li>
                    <li
                      className="py-2 pl-4 text-[#172B4D] hover:bg-gray-100 rounded"
                      onClick={() => {
                        navigate("/alumni/job-postings");
                        toggleMobileMenu();
                      }}
                    >
                      Jobs via Alumni
                    </li>
                    <li
                      className="py-2 pl-4 text-[#172B4D] hover:bg-gray-100 rounded"
                      onClick={() => {
                        navigate("/alumni/contact");
                        toggleMobileMenu();
                      }}
                    >
                      Contact Us
                    </li>
                  </ul>
                </div>
              </li>
              <li>
                <button
                  className="w-full text-left text-[#172B4D]"
                  onClick={() => {
                    navigate("/directory");
                    toggleMobileMenu();
                  }}
                >
                  <div className="flex gap-3 items-center text-base font-medium">
                    <FolderSharedIcon />
                    Directory
                  </div>
                </button>
              </li>
              {isLoggedIn && authUser?.role === 'student' && (
                <li>
                  <button
                    className="w-full text-left text-[#172B4D]"
                    onClick={() => {
                      navigate("/referrals");
                      toggleMobileMenu();
                    }}
                  >
                    <div className="flex gap-3 items-center text-base font-medium">
                      <SendIcon />
                      Referrals
                    </div>
                  </button>
                </li>
              )}
              {isLoggedIn && authUser?.role === 'alumni' && (
                <li>
                  <button
                    className="w-full text-left text-[#172B4D]"
                    onClick={() => {
                      navigate("/referral-inbox");
                      toggleMobileMenu();
                    }}
                  >
                    <div className="flex gap-3 items-center text-base font-medium">
                      <InboxIcon />
                      Referral inbox
                    </div>
                  </button>
                </li>
              )}
              <li>
                <button
                  className="w-full text-left text-[#172B4D]"
                  onClick={() => {
                    navigate("/events");
                    toggleMobileMenu();
                  }}
                >
                  <div className="flex gap-3 items-center text-base font-medium">
                    <EventIcon />
                    Events
                  </div>
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left text-[#172B4D]"
                  onClick={() => {
                    navigate("/news");
                    toggleMobileMenu();
                  }}
                >
                  <div className="flex gap-3 items-center text-base font-medium">
                    <FeedIcon />
                    News
                  </div>
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left text-[#172B4D]"
                  onClick={() => {
                    window.open("https://tpcell.iiitkota.ac.in/", "_blank");
                    toggleMobileMenu();
                  }}
                >
                  <div className="flex gap-3 items-center text-base font-medium">
                    <WorkIcon />
                    Placements
                  </div>
                </button>
              </li>
              {isLoggedIn && user ? (
                <>
                  <li className="w-full h-auto flex gap-3">
                    {user.profilePicture ? (
                      <button
                        onClick={() => {
                          navigate("/profile/me");
                          toggleMobileMenu();
                        }}
                      >
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          navigate("/profile/me");
                          toggleMobileMenu();
                        }}
                      >
                        <img
                          src={Avatar}
                          alt="Default Avatar"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigate("/profile/me");
                        toggleMobileMenu();
                      }}
                    >
                      <div className="flex gap-3 items-center text-[#172B4D] text-base font-medium">
                        Profile
                      </div>
                    </button>
                  </li>
                  <li>
                    <button onClick={openLogoutModal}>
                      <div className="flex gap-3 items-center text-[#172B4D] text-base font-medium">
                        <LogoutIcon />
                        Log Out
                      </div>
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={() => {
                      navigate("/signin");
                      toggleMobileMenu();
                    }}
                  >
                    <div className="flex gap-3 items-center text-[#172B4D] text-base font-medium">
                      <LockOpenIcon />
                      Sign In
                    </div>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        open={isLogoutModalOpen}
        onClose={closeLogoutModal}
        aria-labelledby="logout-modal-title"
        aria-describedby="logout-modal-description"
      >
        <Box className="bg-white p-6 rounded shadow-lg w-80 mx-auto mt-24">
          <h2 id="logout-modal-title" className="text-lg font-semibold mb-4">
            Confirm Logout
          </h2>
          <p id="logout-modal-description" className="mb-6">
            Are you sure you want to log out?
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={closeLogoutModal}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Log Out
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Navbar;
