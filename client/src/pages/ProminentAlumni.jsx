import { useState, useRef, useEffect } from "react";
import { Modal, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import alumniData from "../data/prominentAlumni.json"; // Import the JSON data

const ProminentAlumni = () => {
  const [openModalIndex, setOpenModalIndex] = useState(null);
  const [visibleRows, setVisibleRows] = useState({});
  const rowRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.dataset.index !== undefined) {
            setVisibleRows((prev) => ({
              ...prev,
              [entry.target.dataset.index]: entry.isIntersecting,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe only valid elements
    rowRefs.current.forEach((row) => {
      if (row) observer.observe(row);
    });

    // Cleanup observer
    return () => observer.disconnect();
  }, []);

  const handleOpen = (index) => {
    setOpenModalIndex(index);
  };

  const handleClose = () => {
    setOpenModalIndex(null);
  };

  return (
    <div className="w-full h-full overflow-x-hidden custom-scrollbar bg-gradient-to-br from-gray-100 to-blue-50">
      <Navbar />
      <div className="h-auto overflow-y-scroll scrollbar-hide md:mt-[10rem] mt-[6rem] px-6 sm:px-8 lg:px-16">
        <h1 className="text-4xl font-bold leading-loose text-[#1A1C4E] mb-6 text-center">
          Prominent Alumni
        </h1>
        <div className="w-full flex justify-center">
          <div className="w-full max-w-7xl place-items-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {alumniData.map((alumni, index) => (
              <div
                key={index}
                data-index={index}
                ref={(el) => (rowRefs.current[index] = el)}
                onClick={() => handleOpen(index)}
                className={`cursor-pointer w-full sm:w-80 h-60 rounded-lg shadow-xl bg-white transform transition-all duration-700 ease-out delay-${
                  index * 100
                }ms flex flex-col items-center justify-center text-black text-xl font-medium p-4 ${
                  visibleRows[index] ? "opacity-100 scale-100" : "opacity-0 scale-95"
                } hover:shadow-2xl hover:scale-105 transition-transform duration-300`}
              >
                <img
                  src={alumni.imageUrl}
                  alt={alumni.name}
                  className="w-24 h-24 rounded-full mb-2 object-cover"
                />
                <p className="text-xl font-semibold text-[#1A1C4E]">{alumni.name}</p>
                <p className="text-center text-[#1A1C4E] font-normal text-lg">
                  {alumni.bd}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />

      {alumniData.map((alumni, index) => (
        <Modal
          key={index}
          open={openModalIndex === index}
          onClose={handleClose}
          aria-labelledby={`modal-title-${index}`}
          aria-describedby={`modal-description-${index}`}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 400, md: 500 },
              maxHeight: "90vh",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              overflowY: "auto",
            }}
            className="scrollbar-hide"
          >
            <IconButton
              onClick={handleClose}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>
            <img
              src={alumni.imageUrl}
              alt={alumni.name}
              className="w-full h-72 object-cover rounded-lg mb-4"
            />
            <Typography
              id={`modal-title-${index}`}
              variant="h5"
              component="h2"
              className="mb-2 font-bold text-[#1A1C4E]"
            >
              {alumni.name}
            </Typography>
            <Typography
              id={`modal-description-${index}`}
              className="text-gray-700 text-lg"
            >
              {alumni.description}
            </Typography>
          </Box>
        </Modal>
      ))}
    </div>
  );
};

export default ProminentAlumni;
