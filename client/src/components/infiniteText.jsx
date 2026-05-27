import Marquee from "react-fast-marquee";

const InfiniteText = () => {
  return (
    <div className="w-full h-[1.7rem] bg-[#1A1C4E] overflow-hidden flex items-center">
      <Marquee
        pauseOnHover={true}
        gradient={false}
        speed={50}
        className="flex items-center"
      >
        <p className="text-white text-sm font-medium hover:cursor-pointer">
          Research Trajectory: On October 5, 2024, Yashash Jain, a 2021 ECE
          alumnus and SAC ISRO scientist, shared insights on his GATE journey,
          PSU opportunities, and research paths.
        </p>
        {/* Add a separator for better readability */}
        <span className="mx-8 text-white">•</span>
        <p className="text-white text-sm font-medium hover:cursor-pointer">
          Alumni Spotlight: Join us on November 10, 2024, for a webinar with
          Priya Sharma, a 2019 CSE alumna, now a software engineer at Google.
        </p>
        <span className="mx-8 text-white">•</span>
        <p className="text-white text-sm font-medium hover:cursor-pointer">
          Upcoming Event: The annual Alumni Meet is scheduled for December 15,
          2024. Register now to reconnect with your batchmates!
        </p>
      </Marquee>
    </div>
  );
};

export default InfiniteText;