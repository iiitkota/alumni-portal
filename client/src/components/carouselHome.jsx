import { useEffect, useState } from "react";
import "keen-slider/keen-slider.min.css";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";

import Disha from "../../public/assets/1.png";
import LinkedinLinkup from "../../public/assets/3.png";
import ResearchTrajectory from "../../public/assets/4.png";
import AlumniInsights from "../../public/assets/2.png";
import AlumniMeetup from "../../public/assets/homeBanner-6.jpg";
import SessionAbhinavJain from "../../public/assets/homeBanner-5.jpg";
import SessionAnkurAgarwal from "../../public/assets/homeBanner-7.jpg";
import AlumniMeet02 from "../../public/assets/homeBanner-8.jpg";

let APIHOST = import.meta.env.VITE_API_URL || "";

const CarouselHome = () => {
  const [stories, setStories] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get(`${APIHOST}/api/stories`);
        setStories(res.data);
      } catch (err) {
        console.error("Failed to fetch stories", err);
        setStories([]); // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      slideChanged() {
        resetTimer();
      },
    },
    [
      (slider) => {
        let timeout;
        let mouseOver = false;
        function clearNextTimeout() {
          clearTimeout(timeout);
        }
        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 8000);
        }
        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  let timer;
  const startTimer = () => {
    timer = setInterval(() => {
      instanceRef.current?.next();
    }, 8000);
  };

  const resetTimer = () => {
    clearInterval(timer);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timer);
  }, [instanceRef]);

  // Updating keen slider when stories change
  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.update();
    }
  }, [stories, instanceRef]);

  if (loading) {
    return (
      <div className="relative">
        <div className="lg:h-[78vh] md:h-[65vh] sm:h-[55vh] h-[30vh] mt-[8.375rem] max-w-980:mt-[90px] max-w-492:mt-[58px] bg-gray-200 animate-pulse flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Fallback to static images if no stories in database
  const hasStories = stories && stories.length > 0;

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        className="keen-slider lg:h-[78vh] md:h-[65vh] sm:h-[55vh] h-[30vh] mt-[8.375rem] max-w-980:mt-[90px] max-w-492:mt-[58px]"
      >
        {hasStories ? (
          [...stories].reverse().map((story) => (
            <div key={story._id} className="keen-slider__slide flex justify-center items-center">
              <img src={story.imageUrl} alt="Carousel" className="object-fill w-full h-full" />
            </div>
          ))
        ) : (
          <>
            <div className="keen-slider__slide flex justify-center items-center">
              <img src={AlumniMeet02} alt="" className="object-fill w-full h-full" />
            </div>
            <div className="keen-slider__slide flex justify-center items-center">
              <img src={SessionAnkurAgarwal} alt="" className="object-fill w-full h-full" />
            </div>
            <div className="keen-slider__slide flex justify-center items-center">
              <img src={AlumniMeetup} alt="" className="object-fill w-full h-full" />
            </div>
            <div className="keen-slider__slide flex justify-center items-center">
              <img src={SessionAbhinavJain} alt="" className="object-fill w-full h-full" />
            </div>
            <div className="keen-slider__slide flex justify-center items-center">
              <img src={Disha} alt="" className=" object-fill w-full h-full" />
            </div>
            <div className="keen-slider__slide flex justify-center items-center">
              <img src={LinkedinLinkup} alt="" className="object-fill w-full h-full" />
            </div>
            <div className="keen-slider__slide flex justify-center items-center">
              <img src={ResearchTrajectory} alt="" className="object-fill w-full h-full" />
            </div>
            <div className="keen-slider__slide flex justify-center items-center">
              <img src={AlumniInsights} alt="" className="object-fill w-full h-full" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CarouselHome;
