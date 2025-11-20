import { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/Footer.jsx";
import { Box, Typography, Paper, Divider, Button } from "@mui/material";
import CarouselEvents from "../components/CarouselEvents";
// import eventsData from "../data/EventData.json"; // Import the JSON data
import axios from "axios";


 
let APIHOST = import.meta.env.VITE_API_URL

const EventDetails = () => {
	const { title } = useParams();
	const [event, setEvent] = useState(null);
	const[ loading, setLoading] = useState(true)
	const [isCarouselOpen, setIsCarouselOpen] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const res = await axios.get(`${APIHOST}/api/admin/eventposts`);
				const rawEvents = res.data.events;

				const transformed = rawEvents.map((event) => ({
					code: event._id,
					heading: event.title,
					description: event.description,
					eventImages: event.images.map((img) => `${APIHOST}${img.path}`),
					details: event.details,
					date: new Date(event.date).toDateString(),
				}));

				const eventFetched = transformed.find(event => event.code === title)
				setEvent(eventFetched); 
				setLoading(false)
			} catch (error) {
				console.error("Error fetching events:", error);
			}
		};


		// this is the old fetch:
		// const fetchEvent = () => {
		// 	const eventCode = parseInt(title, 10);
		// 	const fetchedEvent = eventsData.find(event => event.code === eventCode);
		// 	setEvent(fetchedEvent);
		// };


		fetchEvent();
	}, [title]);

	const openCarousel = () => {
		setIsCarouselOpen(true);
	};

	const closeCarousel = () => {
		setIsCarouselOpen(false);
	};

	const isSquareImage = (imageUrl) => {
		const img = new Image();
		img.src = imageUrl;
		return img.width === img.height;
	};

	if (loading) {
		return  (
				<div className="flex h-[100vh] items-center justify-center" >
					<Typography variant="h6">  <span className="text-white" >Loading Event Details... </span> </Typography>;

				</div>)
		
	}

	return (
		<div className="w-full h-full overflow-x-hidden custom-scrollbar bg-gradient-to-br from-gray-100 to-blue-50">
			<Navbar />
			<Box sx={{ maxWidth: '1000px', mx: 'auto', mb: '3rem', mt: { lg: '9rem', md: '100px', sm: '75px', xs: '100px' } }} >
				<Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
					{event.eventImages && event.eventImages.length > 0 && (
						<Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
							<img
								src={event.eventImages[0]}
								alt="Event"
								style={{
									width: isSquareImage(event.eventImages[0]) ? '50%' : '100%',
									borderRadius: '8px',
									objectFit: 'contain'
								}}
							/>
						</Box>
					)}
					<Typography sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center', fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
						{event.heading}
					</Typography>
					<Divider sx={{ my: 2 }} />
					<Typography variant="body1" sx={{ mb: 2, textAlign: { xs: 'center', sm: 'left' } }} component="div">
						<div dangerouslySetInnerHTML={{ __html: event.details }} />
					</Typography>
					<Typography sx={{ mb: 2, textAlign: 'right', color: 'gray' }}>
						Posted on {event.date}
					</Typography>
					<Divider sx={{ my: 2 }} />
					<Box sx={{ flexGrow: 1, display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 2 }}>
						<Button variant="contained" color="primary" onClick={openCarousel}>
							View Images
						</Button>
						<Button variant="outlined" onClick={() => navigate('/events')}>
							View All Events
						</Button>
					</Box>
				</Paper>
			</Box>
			<Footer />
			{isCarouselOpen && (
				<CarouselEvents images={event.eventImages} onClose={closeCarousel} />
			)}
		</div>
	);
};

export default EventDetails;