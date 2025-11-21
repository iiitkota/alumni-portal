import { useState, useEffect } from "react";
import {
	Modal,
	Box,
	Typography,
	IconButton,
	Tabs,
	Tab,
	CircularProgress,
} from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import axios from "axios";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import CloseIcon from "@mui/icons-material/Close";


let APIHOST = import.meta.env.VITE_API_URL



// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend
);

const AlumniVisualizations = ({ isOpen, onClose }) => {
	const [activeTab, setActiveTab] = useState(0);
	const [chartData, setChartData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAndProcessData = async () => {
			if (isOpen) {
				try {
					setLoading(true);
					setError(null);

					// Fetch all alumni data from the new endpoint
					const response = await axios.get(
						`${APIHOST}/api/alumni/all`
					);
					const alumniData = response.data.alumni; // Access the 'alumni' key

					// Process data for visualizations
					const processedData = {
						graduationYear: {},
						branch: {},
						city: {},
						company: {},
						role: {},
					};

					alumniData.forEach((alumnus) => {
						// Count graduation years
						processedData.graduationYear[alumnus.graduationYear] =
							(processedData.graduationYear[alumnus.graduationYear] || 0) + 1;

						// Count branches
						processedData.branch[alumnus.branch] =
							(processedData.branch[alumnus.branch] || 0) + 1;

						// Count cities
						processedData.city[alumnus.city] =
							(processedData.city[alumnus.city] || 0) + 1;

						// Count companies
						processedData.company[alumnus.currentCompany] =
							(processedData.company[alumnus.currentCompany] || 0) + 1;

						// Count roles
						processedData.role[alumnus.role] =
							(processedData.role[alumnus.role] || 0) + 1;
					});

					// Helper function to get the top N entries
					const getTopEntries = (data, limit) => {
						return Object.entries(data)
							.sort((a, b) => b[1] - a[1]) // Sort by count in descending order
							.slice(0, limit) // Take the top N entries
							.reduce((acc, [key, value]) => {
								acc[key] = value;
								return acc;
							}, {});
					};

					// Limit data to top entries
					processedData.city = getTopEntries(processedData.city, 25); // Top 25 cities
					processedData.company = getTopEntries(processedData.company, 25); // Top 25 companies
					processedData.role = getTopEntries(processedData.role, 15); // Top 15 roles

					setChartData(processedData);
				} catch (err) {
					console.error("Error fetching analytics data:", err);
					setError("Failed to load analytics data. Please try again later.");
				} finally {
					setLoading(false);
				}
			}
		};

		fetchAndProcessData();
	}, [isOpen]);

	const createChartData = (data, label, backgroundColor) => {
		const labels = Object.keys(data).sort();
		const values = labels.map((key) => data[key]);

		return {
			labels,
			datasets: [
				{
					label,
					data: values,
					backgroundColor,
					borderColor: backgroundColor,
					borderWidth: 1,
				},
			],
		};
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top",
			},
		},
	};

	const renderChart = () => {
		if (!chartData) return null;

		switch (activeTab) {
			case 0: // Graduation Year
				return (
					<div className="h-[400px]">
						<Bar
							data={createChartData(
								chartData.graduationYear,
								"Alumni by Graduation Year",
								"rgba(25, 25, 77, 0.8)"
							)}
							options={chartOptions}
						/>
					</div>
				);
			case 1: // Branch
				return (
					<div className="h-[400px]">
						<Pie
							data={createChartData(chartData.branch, "Alumni by Branch", [
								"rgba(25, 25, 77, 0.8)",
								"rgba(0, 150, 136, 0.8)",
								"rgba(156, 39, 176, 0.8)",
								"rgba(76, 175, 80, 0.8)",
								"rgba(255, 152, 0, 0.8)",
							])}
							options={chartOptions}
						/>
					</div>
				);
			case 2: // City
				return (
					<div className="h-[400px]">
						<Bar
							data={createChartData(
								chartData.city,
								"Alumni by City",
								"rgba(0, 150, 136, 0.8)"
							)}
							options={chartOptions}
						/>
					</div>
				);
			case 3: // Company
				return (
					<div className="h-[400px]">
						<Bar
							data={createChartData(
								chartData.company,
								"Alumni by Company",
								"rgba(156, 39, 176, 0.8)"
							)}
							options={chartOptions}
						/>
					</div>
				);
			case 4: // Role
				return (
					<div className="h-[400px]">
						<Pie
							data={createChartData(chartData.role, "Alumni by Role", [
								"rgba(76, 175, 80, 0.8)",
								"rgba(255, 152, 0, 0.8)",
								"rgba(233, 30, 99, 0.8)",
								"rgba(33, 150, 243, 0.8)",
								"rgba(156, 39, 176, 0.8)",
							])}
							options={chartOptions}
						/>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<Modal
			open={isOpen}
			onClose={onClose}
			aria-labelledby="visualization-modal-title"
		>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: { xs: "95%", sm: "80%", md: "70%" },
					maxHeight: "90vh",
					bgcolor: "background.paper",
					boxShadow: 24,
					p: 4,
					borderRadius: 2,
					overflowY: "auto",
				}}
			>
				<IconButton
					onClick={onClose}
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

				{loading ? (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							minHeight: "400px",
						}}
					>
						<CircularProgress />
						<Typography variant="body1" sx={{ mt: 2 }}>
							Loading Analytics...
						</Typography>
					</Box>
				) : error ? (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							minHeight: "400px",
							textAlign: "center",
						}}
					>
						<Typography variant="h6" color="error" sx={{ mb: 2 }}>
							{error}
						</Typography>
						<Typography variant="body2">
							Please check your internet connection and try again.
						</Typography>
					</Box>
				) : (
					<>
						<Typography
							variant="h5"
							component="h2"
							sx={{
								mb: 3,
								color: "#1A202C",
								fontWeight: "bold",
								textAlign: "center",
							}}
						>
							Alumni Analytics Dashboard
						</Typography>

						<Tabs
							value={activeTab}
							onChange={(event, newValue) => setActiveTab(newValue)}
							variant="scrollable"
							scrollButtons="auto"
							sx={{
								mb: 3,
								"& .MuiTabs-indicator": {
									backgroundColor: "#19194D",
								},
							}}
						>
							<Tab label="Graduation Year" />
							<Tab label="Branch" />
							<Tab label="City" />
							<Tab label="Company" />
							<Tab label="Role" />
						</Tabs>

						{chartData && renderChart()}
					</>
				)}
			</Box>
		</Modal>
	);
};

export default AlumniVisualizations;
