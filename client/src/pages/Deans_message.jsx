import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import Dean from "../../public/assets/dean.png";

const Deans_message = () => {
	return (
		<div className="w-full h-full overflow-x-hidden custom-scrollbar bg-white font-sans">
			<Navbar />
			<div className="mt-[9rem] max-w-980:mt-[100px] max-w-492:mt-[75px]">
				{/* Dean's Profile Section */}
				<div className="w-full h-auto flex flex-col justify-center items-center py-12 bg-gradient-to-r from-[#19194D] to-[#2C2C6E]">
					<div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl">
						<img
							src={Dean}
							className="w-full h-full object-cover"
							alt="Dr. Manish Vashistha"
						/>
					</div>
					<h1 className="mt-6 text-3xl md:text-4xl font-bold text-white font-sans">
						Dr. Manish Vashistha
					</h1>
					<h2 className="mt-2 text-lg md:text-xl text-gray-200 font-medium">
						Dean, Alumni and Industry Outreach
					</h2>
					<h3 className="mt-1 text-base md:text-lg text-gray-300 font-normal">
						Ph.D.( Chemical Engg.)
					</h3>
				</div>

				{/* Dean's Message Section */}
				<div className="mt-8 w-full h-auto px-4 md:px-24 lg:px-48 py-12 bg-white">
					<div className="max-w-3xl mx-auto">
						<h2 className="text-3xl md:text-4xl font-bold text-[#19194D] mb-8 font-sans">
							Dean's Message
						</h2>
						<div className="text-[#333333] text-lg leading-relaxed text-justify space-y-6">
							<p>A Warm Greeting to All Alumni, Students, and Well-Wishers,</p>
							<p>
								It brings me great joy to address the esteemed IIIT Kota
								community through this platform dedicated to fostering enduring
								connections and collaboration among our alumni, students, and
								faculty. As the Dean of IIIT Kota, I have had the privilege of
								witnessing the incredible strides our institute has made over
								the years, largely fueled by the accomplishments and dedication
								of our alumni.
							</p>
							<p>
								Our alumni have consistently demonstrated excellence,
								innovation, and leadership in diverse domains. They serve as a
								source of inspiration for our current students, embodying the
								values and spirit of IIIT Kota in their professional journeys.
							</p>
							<p>
								The Alumni Cell is a testament to our commitment to nurturing a
								lifelong relationship with every member of our IIIT Kota family.
								It is not just a platform but a dynamic ecosystem where
								knowledge is exchanged, mentorship is fostered, and
								collaborations are born. Through various initiatives such as the
								Alumni Mentorship Program, interactive webinars, and networking
								events, we strive to create an environment where our students
								and alumni can engage meaningfully.
							</p>
							<p>
								I urge all of you to actively participate in these endeavors,
								share your insights, and contribute to the institute’s growth
								and legacy. I also take this opportunity to express my gratitude
								to the Alumni Cell team for their unwavering dedication and
								efforts in curating this platform.
							</p>
							<p>
								Together, let us build a future that reflects the collective
								excellence of IIIT Kota. Wishing you all success and fulfillment
								in your pursuits. Let us continue to elevate the IIIT Kota name
								with pride.
							</p>
							<p>
								With warm regards and best wishes,
								<br />
								<strong>Prof. Manish Vashishtha</strong>
								<br />
								Dean of Alumni and Industry Outreach
							</p>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default Deans_message;
