import { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Divider, IconButton, Modal } from "@mui/material";
import Navbar from "../components/navbar";
import Footer from "../components/Footer.jsx";
import jobsData from "../data/jobsData.json"; // Import the JSON data
import {
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import XIcon from "@mui/icons-material/X"; // Import the new X icon

const JobDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const job = location.state?.job || jobsData.jobCards.find(job => job.id === id) || jobsData.internCards.find(intern => intern.id === id);

  // State for Share Modal
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleShareClick = () => {
    setShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };

  // Share Options
  const shareOptions = [
    {
      icon: <EmailIcon style={{ color: "#D44638", fontSize: "2rem" }} />,
      label: "Email",
      link: `mailto:?subject=Check out this Job shared on the Alumni Portal, IIIT Kota&body=Check out this Job shared on the Alumni Portal, IIIT Kota: ${window.location.origin}/alumni/job-postings/${job?.id}`,
    },
    {
      icon: <WhatsAppIcon style={{ color: "#25D366", fontSize: "2rem" }} />,
      label: "WhatsApp",
      link: `https://wa.me/?text=Check out this Job shared on the Alumni Portal, IIIT Kota: ${window.location.origin}/alumni/job-postings/${job?.id}`,
    },
    {
      icon: <XIcon style={{ color: "#000000", fontSize: "2rem" }} />, // Updated to use XIcon
      label: "X (Twitter)",
      link: `https://twitter.com/intent/tweet?text=Check out this Job shared on the Alumni Portal, IIIT Kota: ${window.location.origin}/alumni/job-postings/${job?.id}`,
    },
    {
      icon: <TelegramIcon style={{ color: "#0088cc", fontSize: "2rem" }} />,
      label: "Telegram",
      link: `https://t.me/share/url?url=${window.location.origin}/alumni/job-postings/${job?.id}&text=Check out this Job shared on the Alumni Portal, IIIT Kota`,
    },
    {
      icon: <LinkIcon style={{ color: "#000000", fontSize: "2rem" }} />,
      label: "Copy Link",
      link: `#`,
      onClick: () =>
        navigator.clipboard.writeText(
          `${window.location.origin}/alumni/job-postings/${job?.id}`
        ),
    },
  ];

  if (!job) {
    return <Typography variant="h6">Job not found</Typography>;
  }

  return (
    <div className="w-full h-full overflow-x-hidden custom-scrollbar bg-gradient-to-br from-gray-100 to-blue-50">
      <Navbar />
      <Box sx={{ maxWidth: '800px', mx: 'auto', mb: '3rem', mt: { lg: '9rem', md: '100px', sm: '75px', xs: '100px' } }} >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              {job.title}
            </Typography>
            <IconButton aria-label="share" onClick={handleShareClick}>
              <ShareIcon />
            </IconButton>
          </Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {job.company} - {job.location}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" sx={{ mb: 2 }}>
            {job.description}
          </Typography>
          {job.about && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {job.about}
            </Typography>
          )}
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Skills Required:</strong> {job.skills}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Experience Required:</strong> {job.experience}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Deadline:</strong> {job.deadline}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <img src={job.postedBy.picture} alt={job.postedBy.name} className="w-10 h-10 rounded-full object-cover mr-2" />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {job.postedBy.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Batch of {job.postedBy.batch}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {job.postedBy.currentPosition}
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2 }}>
            Apply
          </Button>
          <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => navigate('/alumni/job-postings')}>
            View All Jobs
          </Button>
        </Paper>
      </Box>
      <Footer />

      {/* Share Modal */}
      <Modal
        open={shareModalOpen}
        onClose={handleCloseShareModal}
        aria-labelledby="share-modal-title"
        aria-describedby="share-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 300, sm: 400 },
            bgcolor: "background.paper",
            border: "none",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            textAlign: "center",
          }}
        >
          {/* Close 'X' Button */}
          <IconButton
            aria-label="close"
            onClick={handleCloseShareModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#4A5568",
              "&:hover": {
                color: "#1A202C",
                backgroundColor: "transparent",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            id="share-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2, color: "#1A202C", fontWeight: "bold", fontSize: "1.5rem" }}
          >
            Share This Job
          </Typography>
          <Typography
            id="share-modal-description"
            sx={{ mb: 3, color: "#4A5568", fontSize: "0.9rem" }}
          >
            Choose a platform to share this job with others:
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: 2,
              justifyContent: "center",
            }}
          >
            {shareOptions.map((option, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: "#F7FAFC",
                  transition: "background-color 0.3s",
                  "&:hover": {
                    bgcolor: "#EDF2F7",
                    cursor: "pointer",
                  },
                }}
                onClick={() => {
                  if (option.onClick) option.onClick();
                  else window.open(option.link, "_blank");
                  handleCloseShareModal();
                }}
              >
                {option.icon}
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.875rem", color: "#4A5568" }}
                >
                  {option.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default JobDetails;