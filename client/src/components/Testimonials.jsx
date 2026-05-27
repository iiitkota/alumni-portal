import { useState } from "react";
import Marquee from "react-fast-marquee";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

const Testimonials = () => {
  const [isPaused, setIsPaused] = useState(false);

  const handlePausePlay = () => {
    setIsPaused(!isPaused);
  };

  const testimonials = [
    {
      name: "Gaurav Luhariwala",
      text: "Returning to the college was a delightful experience. Seeing the campus for the first time brought back fond memories. The alumni team members, Hiteshwar and Partik, along with faculty head - Chetna ma'am, were exceptionally gracious, ensuring our stay was comfortable and memorable. Their dedication made our visit as alumni truly special.",
    },
    {
      name: "Shreyansh",
      text: "The arrangements for the ‘Startup 101’ talk were top-notch, providing insightful discussions on entrepreneurship fundamentals. Our travel arrangements were exceptionally smooth, allowing us to focus entirely on reconnecting with the college community. We are grateful for the meticulous planning and warm hospitality extended to us during our visit",
    },
    {
      name: "Yashash Jain",
      text: "It was my honour to visit my alma mater as a speaker. Spending four memorable years as a student was crucial. Visiting the new campus at Kota was a great experience. The alumni cell team did an amazing job with queries, travel arrangements, and hospitality. I loved talking with juniors and answering their questions.",
    },
    {
      name: "Gaurav Luhariwala",
      text: "Returning to the college was a delightful experience. Seeing the campus for the first time brought back fond memories. The alumni team members, Hiteshwar and Partik, along with faculty head - Chetna ma'am, were exceptionally gracious, ensuring our stay was comfortable and memorable. Their dedication made our visit as alumni truly special.",
    },
    {
      name: "Shreyansh",
      text: "The arrangements for the ‘Startup 101’ talk were top-notch, providing insightful discussions on entrepreneurship fundamentals. Our travel arrangements were exceptionally smooth, allowing us to focus entirely on reconnecting with the college community. We are grateful for the meticulous planning and warm hospitality extended to us during our visit",
    },
    {
      name: "Yashash Jain",
      text: "It was my honour to visit my alma mater as a speaker. Spending four memorable years as a student was crucial. Visiting the new campus at Kota was a great experience. The alumni cell team did an amazing job with queries, travel arrangements, and hospitality. I loved talking with juniors and answering their questions.",
    },
  ];

  return (
    <div className="w-full bg-[#19194D] py-12">
      {/* Heading and Pause/Play Button */}
      <div className="flex justify-center items-center mb-8">
        <h2 className="md:text-4xl text-2xl font-bold text-white text-center mr-4">
          Alumni Testimonials
        </h2>
        <button
          onClick={handlePausePlay}
          className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 transition rounded-full text-white"
          aria-label={isPaused ? "Play" : "Pause"}
        >
          {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
        </button>
      </div>

      {/* Testimonials Marquee */}
      <div className="h-auto flex items-center">
        <Marquee pauseOnHover={false} speed={50} gradient={false} play={!isPaused}>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="w-80 bg-white shadow-lg p-6 mx-6 rounded-lg flex-shrink-0 transform transition-transform duration-300 "
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {testimonial.name[0]}
                  </span>
                </div>
                <p className="text-gray-700 italic text-center mb-4">
                  "{testimonial.text}"
                </p>
                <p className="text-[#19194D] font-semibold">- {testimonial.name}</p>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default Testimonials;
