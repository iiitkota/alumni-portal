import { useEffect, useRef, useState } from "react";
import iiitkotalogo from "../assets/iiitkotalogo.png";
import CountUp from "countup";
import "intersection-observer"; // Polyfill for older browsers

import Navbar from "../components/navbar.jsx";
import CarouselHome from "../components/carouselHome.jsx";
import InfiniteText from "../components/infiniteText.jsx";
import NewsArticlesHome from "../components/NewsArticlesHome.jsx";
import Testimonials from "../components/Testimonials.jsx";
import Footer from "../components/Footer.jsx";

import CollectionsIcon from "@mui/icons-material/Collections";
import GroupsIcon from "@mui/icons-material/Groups";
import EventIcon from "@mui/icons-material/Event";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate } from "react-router-dom";

import Dean from "../../public/assets/dean.png";

const Home = () => {
	const scrollableDivRef = useRef(null); // Create a ref for the scrollable div
	const [showButton, setShowButton] = useState(false); // State to track button visibility
	const navigate = useNavigate();

	useEffect(() => {
		const counters = document.querySelectorAll(".counter");

		const animateCounters = (entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const counter = entry.target;
					const target = +counter.getAttribute("data-target");
					const countElement = counter.querySelector(".count");

					const countUp = new CountUp(countElement, 0, target, 0, 2.5, {
						suffix: counter.getAttribute("data-suffix") || "",
					});
					countUp.start();
					observer.unobserve(counter);
				}
			});
		};

		const observer = new IntersectionObserver(animateCounters, {
			threshold: 0.5, // Trigger when at least 50% of the element is visible
		});

		counters.forEach((counter) => {
			observer.observe(counter);
		});
	}, []);

	return (
		<div
			className="w-full h-full overflow-x-hidden custom-scrollbar bg-gray-100 font-roboto"
			ref={scrollableDivRef}
		>
			<Navbar />
			<CarouselHome />
			<InfiniteText />

			{/* About Us Section */}
			<div className="w-full h-auto py-12 bg-white flex flex-col justify-center items-center">
				<h2 className="w-[90%] lg:w-[80%] text-3xl lg:text-4xl font-bold text-[#19194D] mb-6 text-center">
					About Alumni Cell, IIIT Kota
				</h2>
				<p className="w-[90%] lg:w-[80%] text-base lg:text-lg text-[#4a5568] leading-relaxed mb-8 text-justify">
					The Alumni Cell of IIIT Kota is dedicated to fostering meaningful
					connections between alumni and the institute. Through collaborative
					efforts, we aim to create opportunities for engagement, mentorship,
					and knowledge sharing. Our mission is to celebrate the achievements of
					our alumni while providing guidance and support to current students.
					Together, we build a vibrant and enduring network that reflects the
					legacy and growth of IIIT Kota.
					<br />
					<br />
					We aim to celebrate the achievements of our alumni while inspiring
					current students to reach their fullest potential. By providing a
					platform for knowledge sharing, career guidance, and networking, the
					Alumni Cell ensures that the legacy of IIIT Kota continues to thrive,
					empowering individuals to contribute meaningfully to society and their
					fields.
				</p>
				<div className="w-[90%] lg:w-[80%] flex justify-start">
					<button
						className="w-[7rem] lg:w-[8rem] h-[3rem] bg-[#19194D] hover:bg-[#0E407C] transition-colors duration-300 ease-in-out rounded-lg shadow-lg text-white font-semibold flex justify-center items-center"
						onClick={() => navigate("/about")}
					>
						Read More
					</button>
				</div>
			</div>

			{/* Stats Section */}
			<div className="w-full h-[10rem] lg:h-[15rem] bg-[#19194D] lg:p-4">
				<div className="w-full h-full flex flex-row gap-2">
					<div
						className="counter w-1/3 h-full flex flex-col gap-2 justify-center items-center text-white"
						data-target="8"
					>
						<p className="count text-3xl lg:text-5xl font-bold">0</p>
						<p className="text-center text-sm lg:text-xl text-[#38B6FF]">
							Events
						</p>
					</div>
					<div
						className="counter w-1/3 h-full flex flex-col gap-2 justify-center items-center text-white"
						data-target="200"
						data-suffix="+"
					>
						<p className="count text-3xl lg:text-5xl font-bold">0</p>
						<p className="text-center text-sm lg:text-xl text-[#38B6FF]">
							Alumni Registered
						</p>
					</div>
					<div
						className="counter w-1/3 h-full flex flex-col gap-2 justify-center items-center text-white"
						data-target="8"
					>
						<p className="count text-3xl lg:text-5xl font-bold">0</p>
						<p className="text-center text-sm lg:text-xl text-[#38B6FF]">
							Batches
						</p>
					</div>
				</div>
			</div>

			{/* Director's Message Section */}
			<div className="w-full bg-gray-100 py-12 px-4 md:px-8">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-8">
					<div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start space-y-6">
						<div className="flex flex-col items-center md:items-start">
							<img
								src={Dean}
								alt="Director"
								className="w-32 h-32 rounded-full object-cover shadow-lg mb-4"
							/>
							<h2 className="text-3xl font-bold text-[#19194D] text-center md:text-left">
								Dean's Message
							</h2>
						</div>
						<p className="w-[90%] lg:w-[80%] text-base lg:text-lg text-[#4A5568] leading-relaxed mb-8 text-justify">
							A Warm Greeting to All Alumni, Students, and Well-Wishers, It
							brings me great joy to address the esteemed IIIT Kota community
							through this platform dedicated to fostering enduring connections
							and collaboration among our alumni, students, and faculty. As the
							Dean of IIIT Kota, I have had the privilege of witnessing the
							incredible strides our institute has made over the years, largely
							fueled by the accomplishments and dedication of our alumni. Our
							alumni have consistently demonstrated excellence, innovation, and
							leadership in diverse domains...{" "}
							<a href="/deans-message" className="text-[#19194D]/90 hover:underline">Read More</a>
						</p>
						<div className="text-center md:text-left">
							<p className="text-lg font-semibold text-[#19194D]">
								Dr. Manish Vashistha
							</p>
							<p className="text-lg text-gray-700 font-medium">
								Dean, Alumni and Industry Outreach
							</p>
						</div>
					</div>
					<div className="w-full md:w-1/2 flex justify-center items-center">
						<div className="w-full max-w-[640px] rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300">
							<iframe
								className="w-full h-[200px] sm:h-[300px] md:h-[360px]"
								src="https://www.youtube.com/embed/xTzv_dVrNVU?si=Nq06_Q68L77BIh8G"
								title="YouTube video player"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								referrerPolicy="strict-origin-when-cross-origin"
							></iframe>
						</div>
					</div>
				</div>
			</div>

			{/* Testimonials Section */}
			<Testimonials />

			{/* Benefits Offered Section */}
			<div className="w-full h-auto text-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 lg:px-8">
				<h1 className="text-center text-4xl font-bold mb-12 text-[#19194D]">
					Benefits Offered
				</h1>
				<div className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-7xl mx-auto">
					<div className="w-full lg:w-[30%] h-[20rem] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out bg-white group overflow-hidden">
						<div className="w-full h-1/3 flex items-center justify-center bg-[#19194D] group-hover:bg-blue-600 transition-all duration-500 ease-in-out">
							<p className="text-xl lg:text-2xl font-semibold text-white">
								Career Development
							</p>
						</div>
						<div className="w-full h-2/3 flex items-center justify-center p-6">
							<p className="text-sm lg:text-base text-gray-700 text-center">
								Access exclusive job postings, internships, and career resources
								shared by fellow alumni, helping current students and graduates
								achieve their career goals.
							</p>
						</div>
					</div>
					<div className="w-full lg:w-[30%] h-[20rem] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out bg-white group overflow-hidden">
						<div className="w-full h-1/3 flex items-center justify-center bg-[#19194D] group-hover:bg-blue-600 transition-all duration-500 ease-in-out">
							<p className="text-xl lg:text-2xl font-semibold text-white text-center">
								Networking Opportunities
							</p>
						</div>
						<div className="w-full h-2/3 flex items-center justify-center p-6">
							<p className="text-sm lg:text-base text-gray-700 text-center">
								Connect with a vast network of IIIT Kota alumni working in
								various industries worldwide, opening doors for career guidance,
								mentorship, and potential collaborations.
							</p>
						</div>
					</div>
					<div className="w-full lg:w-[30%] h-[20rem] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out bg-white group overflow-hidden">
						<div className="w-full h-1/3 flex items-center justify-center bg-[#19194D] group-hover:bg-blue-600 transition-all duration-500 ease-in-out">
							<p className="text-xl lg:text-2xl font-semibold text-white">
								Community Support
							</p>
						</div>
						<div className="w-full h-2/3 flex items-center justify-center p-6">
							<p className="text-sm lg:text-base text-gray-700 text-center">
								Engage with a supportive alumni community that offers
								assistance, advice, and shared experiences, strengthening the
								IIIT Kota network and its values.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Access Section */}
			<div className="w-full h-auto lg:h-[400px] bg-[#19194D] flex justify-center items-center py-12 px-4 lg:px-8">
				<div className="w-full max-w-7xl h-full flex flex-col items-center">
					<div className="w-full h-[30%] flex flex-col justify-end items-center text-white font-bold text-3xl lg:text-4xl pb-6">
						Quick Access
					</div>
					<div className="w-full h-[70%] flex justify-center items-center">
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
							<div
								className="w-[10rem] h-[10rem] lg:w-[12rem] lg:h-[12rem] bg-[#1761A1] rounded-xl flex flex-col justify-center items-center gap-3 hover:bg-blue-600 hover:scale-105 transition-all duration-300 ease-in-out text-white shadow-lg cursor-pointer"
								onClick={() => navigate("/directory")}
							>
								<GroupsIcon style={{ width: "3.5rem", height: "3.5rem" }} />
								<p className="text-lg font-semibold">Directory</p>
							</div>
							<div
								className="w-[10rem] h-[10rem] lg:w-[12rem] lg:h-[12rem] bg-[#1761A1] rounded-xl flex flex-col justify-center items-center gap-3 hover:bg-blue-600 hover:scale-105 transition-all duration-300 ease-in-out text-white shadow-lg cursor-pointer"
								onClick={() => navigate("/events")}
							>
								<EventIcon style={{ width: "3.5rem", height: "3.5rem" }} />
								<p className="text-lg font-semibold">Events</p>
							</div>
							<div
								className="w-[10rem] h-[10rem] lg:w-[12rem] lg:h-[12rem] bg-[#1761A1] rounded-xl flex flex-col justify-center items-center gap-3 hover:bg-blue-600 hover:scale-105 transition-all duration-300 ease-in-out text-white shadow-lg cursor-pointer"
								onClick={() => navigate("/alumni/gallery")}
							>
								<CollectionsIcon
									style={{ width: "3.5rem", height: "3.5rem" }}
								/>
								<p className="text-lg font-semibold">Gallery</p>
							</div>
							<div
								className="w-[10rem] h-[10rem] lg:w-[12rem] lg:h-[12rem] bg-[#1761A1] rounded-xl flex flex-col justify-center items-center gap-3 hover:bg-blue-600 hover:scale-105 transition-all duration-300 ease-in-out text-white shadow-lg cursor-pointer"
								onClick={() => navigate("/alumni/prominent-alumni")}
							>
								<SchoolIcon style={{ width: "3.5rem", height: "3.5rem" }} />
								<p className="text-lg font-semibold text-center">
									Prominent <br /> Alumni
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* News and Articles Section */}
			<NewsArticlesHome />

			{/* Footer */}
			<Footer />
		</div>
	);
};

export default Home;
