import { useNavigate } from "react-router-dom"; // Import useNavigate
import Logo from "../assets/iiitkotalogo.png";
// import FacebookIcon from "@mui/icons-material/Facebook";
// import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
// import YoutubeIcon from "@mui/icons-material/YouTube";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";

const Footer = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <div className="w-full h-[500px] max-w-980:h-[750px] max-w-492:h-[1000px] bg-[#19194D] flex flex-col max-w-492:gap-8">
      <div className="flex flex-row max-w-980:flex-col p-2 max-w-980:p-1 w-full h-[90%] items-center">
        <div className="w-[75%] max-w-980:w-full h-4/5 border-r max-w-980:border-0 border-slate-700 pl-8 text-xl pr-8">
          <div className="w-full h-[27px] mt-16 text-white flex max-w-980:flex-col max-w-980:gap-6">
            <a
              href="https://goo.gl/maps/KfBmHcSVKmzt3hvj7"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LocationOnIcon /> IIIT Kota Permanent Campus, Kota, 325003
            </a>
            <a
              href="mailto:alumni@iiitkota.ac.in"
              className="ml-8 max-w-980:ml-0"
            >
              <EmailIcon /> alumni@iiitkota.ac.in
            </a>
          </div>
          <div className="w-full h-[27px] mt-6 max-w-980:mt-20 text-white">
            <a href="tel:0744-2667000">
              <LocalPhoneIcon /> 0744-2667000, 0744-2667010
            </a>
          </div>
          <div className="w-full h-[27px] max-w-492:h-[150px] mt-12 text-sm flex max-w-492:flex-col gap-16 max-w-492:gap-2 border-b border-slate-700 pb-[3rem]">
            <button
              onClick={() => navigate("/about")}
              className="text-[#38B6FF] text-left"
            >
              ABOUT <ArrowRightAltIcon />
            </button>
            <button
              onClick={() => navigate("/alumni/job-postings")}
              className="text-[#38B6FF] text-left"
            >
              JOBS <ArrowRightAltIcon />
            </button>
            <button
              onClick={() => navigate("/news")}
              className="text-[#38B6FF] text-left"
            >
              NEWS <ArrowRightAltIcon />
            </button>
            <button
              onClick={() => navigate("/events")}
              className="text-[#38B6FF] text-left"
            >
              EVENTS <ArrowRightAltIcon />
            </button>
          </div>
          <div className="w-full h-[27px] max-w-492:h-[150px] mt-8 max-w-980:mb-8 text-sm flex max-w-492:flex-col gap-16 max-w-492:gap-2 border-b border-slate-700 pb-[3rem]">
            <button
              onClick={() => navigate("/gallery")}
              className="text-[#38B6FF] text-left"
            >
              GALLERY <ArrowRightAltIcon />
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="text-[#38B6FF] text-left"
            >
              CONTACT US <ArrowRightAltIcon />
            </button>
            <button
              onClick={() => navigate("/directory")}
              className="text-[#38B6FF] text-left"
            >
              DIRECTORY <ArrowRightAltIcon />
            </button>
            <button
              onClick={() => navigate("/sitemap")}
              className="text-[#38B6FF] text-left"
            >
              SITEMAP <ArrowRightAltIcon />
            </button>
          </div>
        </div>
        <div className="w-[25%] max-w-980:w-full h-4/5 pl-8 max-w-492:mb-16">
          <img
            src={Logo}
            alt=""
            className="w-28 h-28 max-w-980:w-24 max-w-980:h-24"
          />
          <p className="mt-4 mb-6 text-[1.25rem] leading-10 text-[#CED4DA]">
            ALUMNI CELL, <br /> INDIAN INSTITUTE OF INFORMATION TECHNOLOGY KOTA
          </p>
          <a
            href="https://goo.gl/maps/KfBmHcSVKmzt3hvj7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#38B6FF] hover:text-white transition-colors duration-300 ease-in-out"
          >
            VISIT IIIT KOTA <ArrowRightAltIcon />
          </a>
        </div>
      </div>
      {/* Footer Bottom */}
      <div className="bg-[#0E407C] py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-white/90">© 2025 Alumni Cell, IIIT Kota</div>
          <div className="flex space-x-6">
            {/* <a href="https://www.x.com" target="_blank" rel="noopener noreferrer" aria-label="X">
              <XIcon className="text-white hover:text-[#38B6FF] transition-colors duration-300 cursor-pointer" />
            </a> */}
            {/* <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookIcon className="text-white hover:text-[#38B6FF] transition-colors duration-300 cursor-pointer" />
            </a> */}
            <a href="https://www.instagram.com/alumnicell.iiitkota?igsh=cXlwNGxhcnNvdGc3" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon className="text-white hover:text-[#38B6FF] transition-colors duration-300 cursor-pointer" />
            </a>
            <a href="https://www.linkedin.com/in/alumnicell-iiitkota/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <LinkedInIcon className="text-white hover:text-[#38B6FF] transition-colors duration-300 cursor-pointer" />
            </a>
            {/* <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <YoutubeIcon className="text-white hover:text-[#38B6FF] transition-colors duration-300 cursor-pointer" />
            </a> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
