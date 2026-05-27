import { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Carousel = ({ images, onClose }) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === "ArrowRight") nextImage();
			if (event.key === "ArrowLeft") prevImage();
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentIndex]);

	const nextImage = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
	};

	const prevImage = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === 0 ? images.length - 1 : prevIndex - 1
		);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
			<IconButton
				onClick={onClose}
				className="text-white hover:text-white transition-colors duration-300 z-[60]"
				aria-label="Close"
				style={{ position: "absolute", top: 20, right: 20 }}
			>
				<CloseIcon style={{ fontSize: 30, color: 'white' }} />
			</IconButton>
			<div className="relative max-w-screen-lg w-full h-auto flex items-center justify-between">
				<IconButton
					onClick={prevImage}
					className="text-gray-300 hover:text-white bg-black bg-opacity-50 p-2 rounded-full transition hover:bg-opacity-75 shadow-lg"
					aria-label="Previous Image"
				>
					<ArrowBackIosNewIcon style={{ fontSize: 30, color: 'white' }} />
				</IconButton>

				<div className="relative mx-4">
					<img
						src={images[currentIndex]}
						alt={`Slide ${currentIndex + 1}`}
						className="lg:max-h-[80vh] md:max-h-[70vh] max-h-[50vh] object-contain mx-auto rounded-lg shadow-lg transition-transform duration-300"
					/>
					<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-300 bg-black bg-opacity-50 rounded-full px-4 py-1 text-sm shadow-lg">
						{currentIndex + 1} / {images.length}
					</div>
				</div>

				<IconButton
					onClick={nextImage}
					className="text-gray-300 hover:text-white bg-black bg-opacity-50 p-2 rounded-full transition hover:bg-opacity-75 shadow-lg"
					aria-label="Next Image"
				>
					<ArrowForwardIosIcon style={{ fontSize: 30, color: 'white' }} />
				</IconButton>
			</div>
		</div>
	);
};

export default Carousel;
