import { useEffect } from "react";
import "keen-slider/keen-slider.min.css";
import Disha from "../../public/assets/1.png";
import LinkedinLinkup from "../../public/assets/3.png";
import ResearchTrajectory from "../../public/assets/4.png";
import AlumniInsights from "../../public/assets/2.png";
import AlumniMeetup from "../../public/assets/homeBanner-6.jpg"
import SessionAbhinavJain from "../../public/assets/homeBanner-5.jpg"
import { useKeenSlider } from "keen-slider/react";

const carouselHome = () => {
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slideChanged() {
      resetTimer();
    },
  });

  let timer;

  const startTimer = () => {
    timer = setInterval(() => {
      instanceRef.current?.next();
    }, 8000); // 5000 ms interval for automatic slide change
  };

  const resetTimer = () => {
    clearInterval(timer);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timer);
  }, [instanceRef]);

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        className="keen-slider lg:h-[78vh] md:h-[65vh] sm:h-[55vh] h-[30vh] mt-[8.375rem] max-w-980:mt-[90px] max-w-492:mt-[58px]"
      >
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
      </div>
    </div>
  );
};

export default carouselHome;
