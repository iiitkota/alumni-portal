import { useRef, useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/Footer.jsx";
import { Search as SearchIcon, TrendingUp } from "@mui/icons-material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { TextField, InputAdornment, IconButton, Button, useMediaQuery } from "@mui/material";
import Carousel from "../components/CarouselEvents.jsx"; // Import the Carousel component
import { useNavigate } from "react-router-dom";
import eventsData from "../data/EventData.json"; // Import the JSON data
import axios from "axios"

 
let APIHOST =  import.meta.env.VITE_API_URL


const Events = () => {
  const rowRefs = useRef([]);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [initialEvents, setInitialEvents] = useState([]);
  const [visibleRows, setVisibleRows] = useState({});
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery("(max-width: 768px)"); // Check if the view is mobile

  // useEffect(() => {
  //   setFilteredEvents(eventsData);
  //   setInitialEvents(eventsData);
  // }, []);



  useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${APIHOST}/api/admin/eventposts`);
      const rawEvents = res.data.events;

      const transformed = rawEvents.map((event) => ({
        code: event._id,                   
        heading: event.title,                
        description: event.description,        
        eventImages: event.images.map((img) => `${APIHOST}${img.path}`)  ,
        details: event.details,              
        date: new Date(event.date).toDateString(),  
      }));
      setFilteredEvents(transformed);
      setInitialEvents(transformed);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false)
    }
  };

  fetchEvents();
}, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisibleRows((prev) => ({
            ...prev,
            [entry.target.dataset.index]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    rowRefs.current.forEach((row) => row && observer.observe(row));
    return () => observer.disconnect();
  }, [filteredEvents]);

  const openCarousel = (index) => {
    setCurrentImages(filteredEvents[index].eventImages);
    setIsCarouselOpen(true);
  };

  const closeCarousel = () => {
    setIsCarouselOpen(false);
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    const filtered = initialEvents.filter((event) => {
      const keyword = searchInput.toLowerCase();
      return (
        event.heading.toLowerCase().includes(keyword) ||
        event.description.toLowerCase().includes(keyword)
      );
    });
    setFilteredEvents(filtered);
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setFilteredEvents(initialEvents);
  };

  const navigate = useNavigate();

  const handleEventCardClick = (event) => {
    navigate(`/events/${event.code}`, { state: {event} });
  };

  return (
    <div className="w-full h-full overflow-x-hidden custom-scrollbar bg-gradient-to-br from-gray-100 to-blue-50">
      <Navbar />
      <div className="h-auto mt-[8.375rem] max-w-980:mt-[90px] max-w-492:mt-[70px] overflow-scroll scrollbar-hide md:px-8 px-2 pb-6">
        {/* Search Bar Section */}
        <div className="w-full h-[4rem] flex justify-center items-center mb-8">
          <div className="w-full md:h-[5rem] h-[4.5rem] flex justify-between items-center md:px-6 px-2 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-semibold md:block hidden text-[#19194D]">
              Events by Alumni Cell, IIIT Kota
            </h1>
            <div className="md:w-1/2 w-full flex items-center">
              <TextField
                variant="outlined"
                placeholder="Search Events..."
                fullWidth
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "#4A5568" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch}>
                        <ArrowForwardIcon style={{ color: "#4A5568" }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "gray",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#CBD5E0",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "10px 14px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#CBD5E0",
                  },
                }}
              />
              <Button
                onClick={clearSearch}
                variant="contained"
                color="primary"
                sx={{
                  ml: 2,
                  backgroundColor:
                    searchInput || filteredEvents.length !== initialEvents.length
                      ? "#38B2AC"
                      : "#CBD5E0",
                }}
                disabled={filteredEvents.length === initialEvents.length}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Event Cards Section */}

        

        {filteredEvents.length === 0 ? (
          <div className="w-full h-[20rem] flex justify-center items-center">

            {
              loading == true ? <p> Loading Events... </p> : <p className="text-xl text-gray-500">No events found</p>
            }

            
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div
              key={index}
              className={`w-full h-auto md:h-[20rem] mt-6 flex md:flex-row flex-col max-w-492:flex-col-reverse rounded-lg shadow-xl transform transition-all duration-700 ease-out delay-${
                index * 100
              } ${visibleRows[index] ? "opacity-100" : "opacity-0"} ${
                visibleRows[index] ? "scale-100" : "scale-95"
              }`}
              ref={(el) => (rowRefs.current[index] = el)}
              data-index={index}
            >
              {/* Alternating text and image layout */}
              <div
                className={`md:w-[70%] md:h-full w-full h-auto px-4 flex flex-col max-w-492:justify-center justify-start pt-6 items-center max-w-492:py-8 ${
                  index % 2 === 0 ? "" : "md:order-2 order-1" // Reverse order for alternating layout
                }`}
              >
                <h1 className="w-full py-2 font-bold md:text-xl text-lg text-[#19194D]">
                  {event.heading}
                </h1>
                <p
                  className="mt-3 w-full md:text-lg text-sm text-[#19194D] leading-loose overflow-y-scroll scrollbar-hide mb-4"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
                <div className="w-full flex justify-between items-center mt-auto md:mb-3 -mb-4">
                  <p className="md:text-sm text-xs text-gray-500">
                    Posted on {event.date}
                  </p>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEventCardClick(event)}
                    sx={{ ml: 2 }}
                  >
                    Details
                  </Button>
                </div>
              </div>
              <div
                className={`md:w-[30%] md:min-h-[20rem] w-full h-auto bg-gray-100 hover:cursor-pointer object-cover relative ${
                  index % 2 === 0
                    ? "md:rounded-tl-none md:rounded-bl-none md:rounded-tr-lg md:rounded-br-lg rounded-tl-lg rounded-tr-lg"
                    : "md:order-1 order-2 md:rounded-tr-none md:rounded-br-none md:rounded-tl-lg md:rounded-bl-lg rounded-tl-lg rounded-tr-lg"
                }`}
                onClick={() => openCarousel(index)}
              >
                <img
                  src={event.eventImages[0]}
                  alt="img__"
                  className={`w-full h-full object-cover ${
                    index % 2 === 0
                      ? "md:rounded-bl-none md:rounded-tl-none md:rounded-tr-lg md:rounded-br-lg rounded-tl-lg rounded-tr-lg"
                      : "md:rounded-br-none md:rounded-tr-none md:rounded-tl-lg md:rounded-bl-lg rounded-tl-lg rounded-tr-lg"
                  }`}
                />
                {isMobile ? (
                  <div className="absolute bottom-2 right-2 bg-white bg-opacity-75 rounded-full p-1 flex justify-center items-center">
                    <span style={{ color: "#4A5568", fontSize: "12px" }}>Click</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black bg-opacity-80 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg">
                    <span className="text-white text-center px-4">View More</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <Footer />
      {isCarouselOpen && (
        <Carousel images={currentImages} onClose={closeCarousel} />
      )}
    </div>
  );
};

export default Events;