import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import {
	Button,
	TextField,
	InputAdornment,
	Menu,
	MenuItem,
	IconButton,
	Modal,
	Box,
	Card,
	CardContent,
	Typography,
} from "@mui/material";
import {
	Search as SearchIcon,
	MoreVert as MoreVertIcon,
	Share as ShareIcon,
	Email as EmailIcon,
	WhatsApp as WhatsAppIcon,
	X as XIcon,
	Telegram as TelegramIcon,
	Link as LinkIcon,
	Close as CloseIcon,
} from "@mui/icons-material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Footer from "../components/Footer.jsx";
import axios from "axios";
import emailjs from "@emailjs/browser";
import { toast, Toaster } from "react-hot-toast";
import jobsData from "../data/jobsData.json";

const JobsPosting = () => {
	const [searchPlaceholder, setSearchPlaceholder] = useState(
		"Search jobs by Title, Company, Skills..."
	);
	const [anchorEl, setAnchorEl] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [shareJob, setShareJob] = useState(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [user, setUser] = useState(null);
	const [searchInput, setSearchInput] = useState("");
	const [filteredJobs, setFilteredJobs] = useState([]);
	const [initialJobs, setInitialJobs] = useState([]);
	const [visibleRows, setVisibleRows] = useState({});
	const rowRefs = useRef([]);
	const navigate = useNavigate();
	const [isJobView, setIsJobView] = useState(true);

	const token = localStorage.getItem("token");

	useEffect(() => {
		if (token) {
			setIsLoggedIn(true);
			const fetchUser = async () => {
				try {
					const response = await axios.get(
						"https://alumportal-iiitkotaofficial.onrender.com/api/profile/me",
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					setUser(response.data);
				} catch (error) {
					console.error(error.message);
				}
			};
			fetchUser();
		} else {
			setIsLoggedIn(false);
		}
	}, [token]);

	useEffect(() => {
		const jobCards = isJobView ? jobsData.jobCards : jobsData.internCards;
		if (jobCards.length === 1 && !jobCards[0].id) {
			setFilteredJobs([]);
			setInitialJobs([]);
		} else {
			setFilteredJobs(jobCards);
			setInitialJobs(jobCards);
		}
	}, [isJobView]);

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

		rowRefs.current.forEach((row) => row && observer.observe(row));
		return () => observer.disconnect();
	}, [filteredJobs]);

	const handleJobClick = () => {
		setSearchPlaceholder("Search jobs by Title, Company, Skills...");
		setIsJobView(true);
		setAnchorEl(null);
	};

	const handleInternClick = () => {
		setSearchPlaceholder("Search interns by Title, Company, Skills...");
		setIsJobView(false);
		setAnchorEl(null);
	};

	const handleMenuClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handlePostJobsClick = () => {
		setIsModalOpen(true);
		setAnchorEl(null);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	const handleJobCardClick = (job) => {
		navigate(`/alumni/job-postings/${job.id}`, { state: { job } });
	};

	const handleShareClick = (event, job) => {
		event.stopPropagation();
		setShareJob(job);
		setShareModalOpen(true);
	};

	const handleCloseShareModal = () => {
		setShareModalOpen(false);
		setShareJob(null);
	};

	const handleSearchInputChange = (event) => {
		setSearchInput(event.target.value);
	};

	const handleSearch = () => {
		const filtered = initialJobs.filter((job) => {
			const keyword = searchInput.toLowerCase();
			return (
				job.title.toLowerCase().includes(keyword) ||
				job.company.toLowerCase().includes(keyword) ||
				job.skills.toLowerCase().includes(keyword)
			);
		});
		setFilteredJobs(filtered);
	};

	const handleSearchKeyPress = (event) => {
		if (event.key === "Enter") {
			handleSearch();
		}
	};

	const clearSearch = () => {
		setSearchInput("");
		setFilteredJobs(initialJobs);
	};

	const shareOptions = [
		{
			icon: <EmailIcon style={{ color: "#D44638", fontSize: "2rem" }} />,
			label: "Email",
			link: `mailto:?subject=Check out this Job shared on the Alumni Portal, IIIT Kota&body=Check out this Job shared on the Alumni Portal, IIIT Kota: ${window.location.origin}/alumni/job-postings/${shareJob?.id}`,
		},
		{
			icon: <WhatsAppIcon style={{ color: "#25D366", fontSize: "2rem" }} />,
			label: "WhatsApp",
			link: `https://wa.me/?text=Check out this Job shared on the Alumni Portal, IIIT Kota: ${window.location.origin}/alumni/job-postings/${shareJob?.id}`,
		},
		{
			icon: <XIcon style={{ color: "black", fontSize: "2rem" }} />,
			label: "X",
			link: `https://twitter.com/intent/tweet?text=Check out this Job shared on the Alumni Portal, IIIT Kota: ${window.location.origin}/alumni/job-postings/${shareJob?.id}`,
		},
		{
			icon: <TelegramIcon style={{ color: "#0088cc", fontSize: "2rem" }} />,
			label: "Telegram",
			link: `https://t.me/share/url?url=${window.location.origin}/alumni/job-postings/${shareJob?.id}&text=Check out this Job shared on the Alumni Portal, IIIT Kota`,
		},
		{
			icon: <LinkIcon style={{ color: "#000000", fontSize: "2rem" }} />,
			label: "Copy Link",
			link: `#`,
			onClick: () =>
				navigator.clipboard.writeText(
					`${window.location.origin}/alumni/job-postings/${shareJob?.id}`
				),
		},
	];

	const handleSubmit = (event) => {
		event.preventDefault();
		const formData = new FormData(event.target);
		const jobData = {
			companyName: formData.get("companyName"),
			location: formData.get("location"),
			positionName: formData.get("positionName"),
			positionType: formData.get("positionType"),
			skillsRequired: formData.get("skillsRequired"),
			experienceRequired: formData.get("experienceRequired"),
			about: formData.get("about"),
			deadline: formData.get("deadline"),
			applicationLink: formData.get("applicationLink"),
			postedBy: {
				name: user.name,
				graduationYear: user.graduationYear,
				currentCompany: user.currentCompany,
				branch: user.branch,
			},
		};

		emailjs
			.send("service_wey3wx7", "template_wzlmwv8", jobData, "DXrpGBTFte2R1jdAq")
			.then(
				(response) => {
					toast.success("Your job application has been sent to Alumni Cell!");
					handleCloseModal();
				},
				(error) => {
					// console.log("FAILED...", error.text);
					toast.error("Email sending failed!");
				}
			);
	};

	return (
		<div className="w-full h-full overflow-x-hidden custom-scrollbar bg-gradient-to-br from-gray-100 to-blue-50">
			<Navbar />
			<Toaster position="top-right" />
			<div className="flex-grow overflow-y-scroll scrollbar-hide mt-[9rem] max-w-980:mt-[100px] max-w-492:mt-[75px]">
				<div className="w-full h-auto flex flex-col gap-4">
					<div className="w-full h-auto bg-white py-4 px-2 shadow-md rounded-lg flex justify-between items-center">
						<TextField
							variant="outlined"
							placeholder={searchPlaceholder}
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
									searchInput || filteredJobs.length !== initialJobs.length
										? "#38B2AC"
										: "#CBD5E0",
							}}
							disabled={filteredJobs.length === initialJobs.length}
						>
							Clear
						</Button>
						<IconButton
							aria-label="more"
							aria-controls="long-menu"
							aria-haspopup="true"
							onClick={handleMenuClick}
						>
							<MoreVertIcon />
						</IconButton>
						<Menu
							id="long-menu"
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleMenuClose}
						>
							<MenuItem onClick={handleJobClick}>Job Postings</MenuItem>
							<MenuItem onClick={handleInternClick}>Intern Postings</MenuItem>
							<MenuItem onClick={handlePostJobsClick}>Post Jobs</MenuItem>
						</Menu>
					</div>
					<div className="w-full flex flex-col items-center mb-4">
						{filteredJobs.length === 0 ? (
							<div className="w-full h-[60vh] flex items-center justify-center">
								<Typography variant="h6" color="text.secondary">
									No jobs found
								</Typography>
							</div>
						) : (
							<div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
								{filteredJobs.map((job, index) => (
									<Card
										key={index}
										sx={{
											width: { lg: 400, md: 300, sm: 300, xs: 325 },
											boxShadow: 3,
											borderRadius: 2,
											transition: "transform 0.5s ease-out, box-shadow 0.3s, opacity 0.5s ease-out",
											"&:hover": {
												transform: "translateY(-5px)",
												boxShadow: 6,
												cursor: "pointer",
											},
											position: "relative",
											opacity: visibleRows[index] ? 1 : 0,
											transform: visibleRows[index]
												? "scale(1)"
												: "scale(0.95)",
										}}
										ref={(el) => (rowRefs.current[index] = el)}
										data-index={index}
									>
										<IconButton
											sx={{
												position: "absolute",
												top: 8,
												right: 8,
												transition: "color 0.3s",
												"&:hover": {
													color: "#007BFF",
												},
											}}
											aria-label="share"
											onClick={(event) => handleShareClick(event, job)}
										>
											<ShareIcon />
										</IconButton>
										<CardContent>
											<Typography
												variant="h5"
												component="div"
												sx={{ fontWeight: "bold", color: "#1A202C" }}
											>
												{job.title}
											</Typography>
											<Typography sx={{ mb: 1.5 }} color="text.secondary">
												{job.company} - {job.location}
											</Typography>
											<Typography
												variant="body2"
												sx={{ mb: 1.5, color: "#4A5568" }}
											>
												{job.description}
											</Typography>
											<Typography
												variant="body2"
												sx={{ mb: 1.5, color: "#4A5568" }}
											>
												<strong>Skills Required:</strong> {job.skills}
											</Typography>
											<Typography
												variant="body2"
												sx={{ mb: 1.5, color: "#4A5568" }}
											>
												<strong>Experience Required:</strong> {job.experience}
											</Typography>
											<Typography
												variant="body2"
												sx={{ mb: 1.5, color: "#4A5568" }}
											>
												<strong>Deadline:</strong> {job.deadline}
											</Typography>
											<Box
												sx={{ display: "flex", alignItems: "center", mt: 2 }}
											>
												<img
													src={job.postedBy.picture}
													alt={job.postedBy.name}
													className="w-10 h-10 rounded-full object-cover mr-2"
												/>
												<Box>
													<Typography
														variant="body2"
														sx={{ fontWeight: "bold", color: "#1A202C" }}
													>
														{job.postedBy.name}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Batch of {job.postedBy.batch}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{job.postedBy.currentPosition}
													</Typography>
												</Box>
											</Box>
											<Button
												variant="contained"
												onClick={() => handleJobCardClick(job)}
												color="primary"
												sx={{ mt: 2 }}
											>
												Apply
											</Button>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
			<Footer />
			<Modal
				open={shareModalOpen}
				onClose={handleCloseShareModal}
				aria-labelledby="share-modal-title"
				aria-describedby="share-modal-description"
			>
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: { xs: 300, sm: 400 },
						bgcolor: "background.paper",
						border: "none",
						boxShadow: 24,
						borderRadius: 2,
						p: 4,
						textAlign: "center",
					}}
				>
					{/* Close 'X' Button */}
					<IconButton
						aria-label="close"
						onClick={handleCloseShareModal}
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
							color: "#4A5568",
							"&:hover": {
								color: "#1A202C",
								backgroundColor: "transparent",
							},
						}}
					>
						<CloseIcon />
					</IconButton>

					<Typography
						id="share-modal-title"
						variant="h6"
						component="h2"
						sx={{
							mb: 2,
							color: "#1A202C",
							fontWeight: "bold",
							fontSize: "1.5rem",
						}}
					>
						Share This Job
					</Typography>
					<Typography
						id="share-modal-description"
						sx={{ mb: 3, color: "#4A5568", fontSize: "0.9rem" }}
					>
						Choose a platform to share this job with others:
					</Typography>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
							gap: 2,
							justifyContent: "center",
						}}
					>
						{shareOptions.map((option, index) => (
							<Box
								key={index}
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									gap: 1,
									p: 2,
									borderRadius: 1,
									bgcolor: "#F7FAFC",
									transition: "background-color 0.3s",
									"&:hover": {
										bgcolor: "#EDF2F7",
										cursor: "pointer",
									},
								}}
								onClick={() => {
									if (option.onClick) option.onClick();
									else window.open(option.link, "_blank");
									handleCloseShareModal();
								}}
							>
								{option.icon}
								<Typography
									variant="body2"
									sx={{ fontSize: "0.875rem", color: "#4A5568" }}
								>
									{option.label}
								</Typography>
							</Box>
						))}
					</Box>
				</Box>
			</Modal>
			<Modal
				open={isModalOpen}
				onClose={handleCloseModal}
				aria-labelledby="modal-title"
				aria-describedby="modal-description"
			>
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: "90%",
						maxWidth: 600,
						maxHeight: "90vh",
						bgcolor: "background.paper",
						border: "none",
						boxShadow: 24,
						borderRadius: 2,
						p: 4,
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						gap: 3,
					}}
				>
					{/* Close 'X' Button */}
					<IconButton
						aria-label="close"
						onClick={handleCloseModal}
						sx={{
							position: "absolute",
							top: 16,
							right: 16,
							color: "#4A5568",
							"&:hover": {
								color: "#1A202C",
								backgroundColor: "transparent",
							},
						}}
					>
						<CloseIcon />
					</IconButton>

					{isLoggedIn ? (
						<>
							<Typography
								variant="h4"
								component="h1"
								sx={{
									fontWeight: "bold",
									color: "#19194D",
									textAlign: "center",
								}}
							>
								Post a Job
							</Typography>
							<Typography
								variant="body1"
								sx={{ color: "#4A5568", textAlign: "center" }}
							>
								Fill in the details to post a job.
							</Typography>
							<form onSubmit={handleSubmit} style={{ width: "100%" }}>
								<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
									<TextField
										fullWidth
										margin="normal"
										label="Company Name"
										name="companyName"
										variant="outlined"
										required
										sx={{ backgroundColor: "#F7FAFC", borderRadius: 1 }}
									/>
									<TextField
										fullWidth
										margin="normal"
										label="Location"
										name="location"
										variant="outlined"
										required
										sx={{ backgroundColor: "#F7FAFC", borderRadius: 1 }}
									/>
									<TextField
										fullWidth
										margin="normal"
										label="Position Name"
										name="positionName"
										variant="outlined"
										required
										sx={{ backgroundColor: "#F7FAFC", borderRadius: 1 }}
									/>
									<TextField
										fullWidth
										margin="normal"
										label="Position Type (Full Time, Intern, etc.)"
										name="positionType"
										variant="outlined"
										required
										sx={{ backgroundColor: "#F7FAFC", borderRadius: 1 }}
									/>
									<TextField
										fullWidth
										margin="normal"
										label="Skills Required"
										name="skillsRequired"
										variant="outlined"
										required
										sx={{ backgroundColor: "#F7FAFC", borderRadius: 1 }}
									/>
									<TextField
										fullWidth
										margin="normal"
										label="Experience Required"
										name="experienceRequired"
										variant="outlined"
										required
										sx={{ backgroundColor: "#F7FAFC", borderRadius: 1 }}
									/>
									<TextField
										fullWidth
										margin="normal"
										label="About the Job"
										name="about"
										variant="outlined"
										multiline
										rows={4}
										required
										sx={{ backgroundColor: "#F7FAFC", borderRadius: 1 }}
									/>
									<TextField
										fullWidth
										margin="normal"
										label="Deadline"
										name="deadline"
										variant="outlined"
										type="date"
										InputLabelProps={{
											shrink: true,
										}}
										required
										sx={{ backgroundColor: "#F7FAFC", borderRadius: 1 }}
									/>
									<TextField
										fullWidth
										margin="normal"
										label="Link of Application"
										name="applicationLink"
										variant="outlined"
										required
										sx={{ backgroundColor: "#F7FAFC", borderRadius: 1 }}
									/>
									<Box
										sx={{
											display: "flex",
											justifyContent: "flex-end",
											gap: 2,
											mt: 3,
										}}
									>
										<Button
											onClick={handleCloseModal}
											variant="outlined"
											sx={{ color: "#4A5568", borderColor: "#CBD5E0" }}
										>
											Cancel
										</Button>
										<Button type="submit" variant="contained" color="primary">
											Submit
										</Button>
									</Box>
								</Box>
							</form>
						</>
					) : (
						<Box
							sx={{
								textAlign: "center",
								display: "flex",
								flexDirection: "column",
								gap: 3,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Typography variant="h6" sx={{ color: "#4A5568" }}>
								Please log in to post a job/internship.
							</Typography>
							<Button
								variant="contained"
								color="primary"
								onClick={() => navigate("/signin")}
							>
								Sign In
							</Button>
						</Box>
					)}
				</Box>
			</Modal>
		</div>
	);
};

export default JobsPosting;
