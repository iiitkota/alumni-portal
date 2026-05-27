  import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import NewsCard from "../components/NewsCard";
import Footer from "../components/Footer.jsx";
import { TextField, InputAdornment, IconButton, Button } from "@mui/material";
import { Search, ArrowForward } from "@mui/icons-material";
import axios from 'axios'
// import newsData from "../data/newsData.json";
 
let APIHOST = import.meta.env.VITE_API_URL


const News = () => {
  const { newsId } = useParams();
  const [newsData, setNewsData] = useState([])
  const [searchInput, setSearchInput] = useState("");
  const [filteredNews, setFilteredNews] = useState(newsData);
  const rowRefs = useRef([]);
  const [visibleRows, setVisibleRows] = useState({});
  const [loading, setLoading] = useState(true)

  useEffect(() => {


    const fetchNews = async () => {
      try{
        console.log("Trying fetch req to APIHOST  ", APIHOST)
        const res = await axios.get(`${APIHOST}/api/admin/news`);
        const rawNews = res.data.news;

        const transformed = rawNews.map((news)=>({
          id: news._id,
          title: news.title,
          content: news.content,
          postedOn: new Date(news.postedOn).toDateString(),  
        }))

        setNewsData(transformed)
        setLoading(false)
      } catch(error) {
        console.error(error)
        setLoading(false)
      }
    }



    if (newsId) {
      setTimeout(() => {
        const element = document.getElementById(newsId);
        if (element) {
          const yOffset = -180; // Adjust this value to offset the scroll position
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 0);



    }

    setFilteredNews(newsData)
    fetchNews()
  }, [newsId, newsData]);

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
  }, [filteredNews]);

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    const filtered = newsData.filter((news) => {
      const keyword = searchInput.toLowerCase();
      return (
        news.title.toLowerCase().includes(keyword) ||
        news.content.toLowerCase().includes(keyword)
      );
    });
    setFilteredNews(filtered);
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setFilteredNews(newsData);
  };

  return (
    <div className="w-screen h-screen overflow-x-hidden custom-scrollbar bg-gradient-to-br from-gray-100 to-blue-50">
      <Navbar />
      <div className="h-auto mt-[8.375rem] max-w-980:mt-[90px] max-w-492:mt-[70px] overflow-scroll scrollbar-hide md:px-8 px-2 pb-6">
        {/* Search Bar Section */}
        <div className="w-full h-[4rem] flex justify-center items-center mb-8">
          <div className="w-full md:h-[5rem] h-[4.5rem] flex justify-between items-center md:px-6 px-2 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-semibold md:block hidden text-[#19194D]">
              News by Alumni Cell, IIIT Kota
            </h1>
            <div className="md:w-1/2 w-full flex items-center">
              <TextField
                variant="outlined"
                placeholder="Search News..."
                fullWidth
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search style={{ color: "#4A5568" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch}>
                        <ArrowForward style={{ color: "#4A5568" }} />
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
                    searchInput || filteredNews.length !== newsData.length
                      ? "#38B2AC"
                      : "#CBD5E0",
                }}
                disabled={filteredNews.length === newsData.length}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* News Cards Section */}
        <div className="flex flex-col items-center gap-6 px-4 pb-6">
          {filteredNews.length === 0 ? (
            <div className="w-full h-[20rem] flex justify-center items-center">
              {
                loading == true ? <p> Loading News... </p> :  <p className="text-xl text-gray-500">No news found</p>
              }
              
              
            </div>
          ) : (
            filteredNews.map((news, index) => (
              <div
                key={news.id}
                id={news.id} // Add ID for scrolling
                className={`w-auto h-auto mt-6 flex flex-col rounded-lg shadow-xl transform transition-all duration-700 ease-out delay-${
                  index * 100
                } ${visibleRows[index] ? "opacity-100" : "opacity-0"} ${
                  visibleRows[index] ? "scale-100" : "scale-95"
                }`}
                ref={(el) => (rowRefs.current[index] = el)}
                data-index={index}
                style={{ overflow: "hidden" }}
              >
                <NewsCard
                  id={news.id}
                  title={news.title}
                  content={news.content}
                  referenceLink={news.referenceLink}
                  postedOn={news.postedOn}
                  sx={{ mb: 4 }}
                />
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default News;