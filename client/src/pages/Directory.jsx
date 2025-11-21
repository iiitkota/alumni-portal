import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/Footer";
import AlumniCard from "../components/AlumniCard.jsx";
import SignInPrompt from "./SignInPrompt"; // Import the SignInPrompt component
import AlumniVisualizations from "../components/AlumniVisualizations";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CloseIcon from "@mui/icons-material/Close";
import Loader from "../components/Loader";

 
let APIHOST =  import.meta.env.VITE_API_URL


// Shared Modal for image preview
const ImageModal = ({ isOpen, onClose, imageSrc }) => {
	const modalRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div
				ref={modalRef}
				className="relative w-80 h-80 md:w-96 md:h-96 bg-white rounded-lg shadow-lg overflow-hidden"
			>
				<img src={imageSrc} alt="Full size" className="w-full h-full object-cover" loading="lazy" />
				<button
					onClick={onClose}
					className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full"
				>
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	);
};

const Directory = () => {
	const [alumni, setAlumni] = useState([]);
	const [filters, setFilters] = useState({
		name: "",
		instituteId: "",
		graduationYear: "",
		company: "",
		role: "",
		branch: "",
		city: "",
	});
	const [filteredAlumni, setFilteredAlumni] = useState([]);
	const [graduationYears, setGraduationYears] = useState([]);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [showVisualizationModal, setShowVisualizationModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [token, setToken] = useState(localStorage.getItem("token")); // Get JWT token
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState("");

	//pagination  variables
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(30); // You can make this configurable
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [appliedFilters, setAppliedFilters] = useState({});

	useEffect(() => {
		const controller = new AbortController();
		
		const fetchAlumni = async () => {
			try {
				setLoading(true);
				const response = await axios.get(
					`${APIHOST}/api/alumni`, 
					{
						params: {
							page: currentPage,
							limit: itemsPerPage,
							...appliedFilters,
						},
						signal: controller.signal,
					}
				);
				setAlumni(response.data.alumni);
				setTotalCount(response.data.totalCount);
				setTotalPages(response.data.totalPages);
				setGraduationYears(response.data.graduationYears);
				
			} catch (error) {
				if (error.name !== "CanceledError") {
					console.error("Error fetching alumni data:", error);
				}
				setLoading(false);
			}  finally{
				
				setLoading(false);
			}
		};

		fetchAlumni(); 
		return () => controller.abort();
	}, [currentPage, itemsPerPage, appliedFilters]);

	const handleFilterChange = (e) => {
		setFilters({
			...filters,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setAppliedFilters(filters);
		setCurrentPage(1); // Reset to first page when filters change
	};

	const handleReset = () => {
		setFilters({
			name: "",
			instituteId: "",
			graduationYear: "",
			company: "",
			role: "",
			branch: "",
			city: "",
		});
		setAppliedFilters({});
		setCurrentPage(1);
	};

	const toggleFilterModal = () => {
		setShowFilterModal(!showFilterModal); // Toggle filter modal visibility
	};

	const openImage = useCallback((src) => {
		setSelectedImage(src);
		setIsModalOpen(true);
	}, []);

	const closeImage = useCallback(() => {
		setIsModalOpen(false);
		setSelectedImage("");
	}, []);

	const handleRemoveGraduationYearFilter = () => {
		setFilters((prev) => ({
			...prev,
			graduationYear: "",
		}));
		setAppliedFilters((prev) => ({
			...prev,
			graduationYear: "",
		}));
		setCurrentPage(1);
	};

	return (
		<div className="flex flex-col w-screen h-screen bg-gray-100 ">
			<Navbar />
			<div className="h-[99vh] overflow-y-scroll scrollbar-hide mt-[9rem] max-w-980:mt-[100px] max-w-492:mt-[75px] md:px-2">
				<div className="w-full h-full flex md:gap-4">
					<div className=" stick xl:w-[20%] w-0 xl:h-[70vh] md:h-[85vh] lg:h-[70vh] flex flex-col gap-4 xl:mt-2">
						<div className="mb-4 xl:mb-6 hidden xl:block">
							<div className="text-2xl 3xl:text-4xl font-bold text-gray-800">
								Add Filters
							</div>
							<div className="border-b-2 border-teal-500 w-20 mt-1"></div>
						</div>
						<form
							onSubmit={handleSubmit}
							className="xl:flex hidden flex-col gap-4 3xl:gap-6"
						>
							<input
								type="text"
								name="name"
								placeholder="Name"
								value={filters.name}
								onChange={handleFilterChange}
								className="h-12 3xl:h-16 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
							/>
							<input
								type="text"
								name="instituteId"
								placeholder="Institute ID"
								value={filters.instituteId}
								onChange={handleFilterChange}
								className="h-12 3xl:h-16 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
							/>
							<select
								name="graduationYear"
								value={filters.graduationYear}
								onChange={handleFilterChange}
								className="h-12 3xl:h-16 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
							>
								<option value="">Select Graduation Year</option>
								{graduationYears.map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
							<input
								type="text"
								name="company"
								placeholder="Company"
								value={filters.company}
								onChange={handleFilterChange}
								className="h-12 3xl:h-16 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
							/>
							<input
								type="text"
								name="role"
								placeholder="Role"
								value={filters.role}
								onChange={handleFilterChange}
								className="h-12 3xl:h-16 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
							/>
							<input
								type="text"
								name="branch"
								placeholder="Branch"
								value={filters.branch}
								onChange={handleFilterChange}
								className="h-12 3xl:h-16 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
							/>
							<input
								type="text"
								name="city"
								placeholder="City"
								value={filters.city}
								onChange={handleFilterChange}
								className="h-12 3xl:h-16 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
							/>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={handleReset}
									className="w-1/2 h-12 3xl:h-16 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
								>
									Reset
								</button>
								<button
									type="submit"
									className="w-1/2 h-12 3xl:h-16 bg-blue-950 text-white font-semibold rounded-lg hover:bg-[#19194D] transition-all duration-300 ease-in-out"
								>
									Submit
								</button>
							</div>
						</form>
					</div>




					<div className="xl:w-[80%] w-full  flex flex-col gap-2 h-full pb-1">
						<div className="w-full h-auto bg-white p-4 shadow-md rounded-lg flex flex-col gap-3">
							<div className="flex items-center">
								<p className="text-lg font-semibold text-gray-800">
									{totalCount} alumni
								</p>
								<div className="hidden xl:flex gap-2 ml-auto">
									{!loading && totalCount > 0 && (
										<>
											<button
												onClick={() =>
													setCurrentPage((prev) => Math.max(1, prev - 1))
												}
												disabled={currentPage === 1}
												className="px-3 py-1 bg-blue-950 text-white rounded-lg disabled:opacity-50 hover:bg-[#19194D] transition-colors"
											>
												Previous
											</button>
											<span className="text-gray-700">
												Page {currentPage} of {totalPages}
											</span>
											<button
												onClick={() => setCurrentPage((prev) => prev + 1)}
												disabled={currentPage === totalPages}
												className="px-3 py-1 bg-blue-950 text-white rounded-lg disabled:opacity-50 hover:bg-[#19194D] transition-colors"
											>
												Next
											</button>
										</>
									)}
								</div>
								<div className="flex gap-2 ml-auto">
									<button
										onClick={() => setShowVisualizationModal(true)}
										className="flex items-center gap-2 bg-blue-950 text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#19194D] transition-all duration-300"
									>
										<AnalyticsIcon />
										<span className="hidden sm:inline">View Analytics</span>
									</button>
									<button
										onClick={toggleFilterModal}
										className="bg-blue-950 text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#19194D] xl:hidden"
									>
										Toggle Filters
									</button>
								</div>
							</div>

							{/* Selected Filter Chip */}
							{appliedFilters.graduationYear && (
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
										<span className="text-sm font-medium text-blue-950">
											Graduation Year: {appliedFilters.graduationYear}
										</span>
										<button
											onClick={handleRemoveGraduationYearFilter}
											className="text-blue-950 hover:text-blue-700 transition-colors"
										>
											<CloseIcon fontSize="small" />
										</button>
									</div>
								</div>
							)}
						</div>

						{showFilterModal && (
							<div className="fixed  inset-0 z-50 flex items-center justify-center">
								<div
									className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
									onClick={toggleFilterModal}
								></div>
								<div className="bg-white p-6 rounded-lg shadow-lg z-10 w-11/12 max-w-md relative">
									<button
										onClick={toggleFilterModal}
										className="absolute top-2 right-2 text-4xl text-gray-600 hover:text-gray-800"
									>
										&times;
									</button>
									<h2 className="text-2xl font-semibold text-gray-800 mb-4">
										Filter Alumni
									</h2>
									<form onSubmit={handleSubmit} className="flex flex-col gap-4">
										<input
											type="text"
											name="name"
											placeholder="Name"
											value={filters.name}
											onChange={handleFilterChange}
											className="h-12 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
										/>
										<input
											type="text"
											name="instituteId"
											placeholder="Institute ID"
											value={filters.instituteId}
											onChange={handleFilterChange}
											className="h-12 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
										/>
										<select
											name="graduationYear"
											value={filters.graduationYear}
											onChange={handleFilterChange}
											className="h-12 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
										>
											<option value="">Select Graduation Year</option>
											{graduationYears.map((year) => (
												<option key={year} value={year}>
													{year}
												</option>
											))}
										</select>
										<input
											type="text"
											name="company"
											placeholder="Company"
											value={filters.company}
											onChange={handleFilterChange}
											className="h-12 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
										/>
										<input
											type="text"
											name="role"
											placeholder="Role"
											value={filters.role}
											onChange={handleFilterChange}
											className="h-12 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
										/>
										<input
											type="text"
											name="branch"
											placeholder="Branch"
											value={filters.branch}
											onChange={handleFilterChange}
											className="h-12 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
										/>
										<input
											type="text"
											name="city"
											placeholder="City"
											value={filters.city}
											onChange={handleFilterChange}
											className="h-12 px-4 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19194D]"
										/>
										<div className="flex gap-2">
											<button
												type="button"
												onClick={handleReset}
												className="w-1/2 h-12 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
											>
												Reset
											</button>
											<button
												type="submit"
												className="w-1/2 h-12 bg-blue-950 text-white font-semibold rounded-lg hover:bg-[#19194D] transition-all duration-300 ease-in-out"
											>
												Submit
											</button>
										</div>
									</form>
								</div>
							</div>
						)}
						<div className="w-full h-full overflow-y-scroll scrollbar-hide flex  flex-wrap gap-4 justify-center">
							{loading ? (
								<Loader />
							) : alumni.length === 0 ? (
								<div className="h-full w-full gap-3 flex justify-center items-center bg-white rounded-tr-md rounded-tl-md">
									<div className="h-[200px]" >
										<Loader />	
									</div>
									<p></p>
								</div>
							) : (
								<div className=  "grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
									{alumni.map((alumnus) => (
										<AlumniCard key={alumnus._id} alumniData={alumnus} onOpenImage={openImage} />
									))}
								</div>
							)}
						</div>
						{!loading && totalCount > 0 && (

						<div className="flex   justify-center gap-4 mt-2 pb-2 xl:hidden">
							<button
								onClick={() =>
									setCurrentPage((prev) => Math.max(1, prev - 1))
								}
								disabled={currentPage === 1}
								className="px-4 py-1 bg-blue-950 text-white rounded-lg disabled:opacity-50 hover:bg-[#19194D] transition-colors"
							>
								Previous
							</button>
							<span className="px-4 py-2 text-gray-700">
								Page {currentPage} of {totalPages}
							</span>
							<button
								onClick={() => setCurrentPage((prev) => prev + 1)}
								disabled={currentPage === totalPages}
								className="px-4 py-1 bg-blue-950 text-white rounded-lg disabled:opacity-50 hover:bg-[#19194D] transition-colors"
							>
								Next
							</button>
						</div>
						 
						)}
					</div>
				</div>
			</div>
			{/* <Footer /> */}
			<ImageModal isOpen={isModalOpen} onClose={closeImage} imageSrc={selectedImage} />
			<AlumniVisualizations
				isOpen={showVisualizationModal}
				onClose={() => setShowVisualizationModal(false)}
			/>
		</div>
	);
};

export default Directory;