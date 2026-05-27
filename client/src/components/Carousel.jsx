import  { useState, useEffect } from "react";
import { Close, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const Carousel = ({ images, currentIndex, onClose }) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);

	const handleNext = () => {
		setCurrentImageIndex((prevIndex) =>
			prevIndex === images.length - 1 ? 0 : prevIndex + 1
		);
	};

	const handlePrev = () => {
		setCurrentImageIndex((prevIndex) =>
			prevIndex === 0 ? images.length - 1 : prevIndex - 1
		);
	};

	useEffect(() => {
		const handleKeyPress = (e) => {
			if (e.key === "ArrowRight") handleNext();
			else if (e.key === "ArrowLeft") handlePrev();
			else if (e.key === "Escape") onClose();
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [images.length, onClose]);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
			<div className="relative max-w-screen-lg w-full h-full flex items-center justify-center">
				<button
					onClick={(e) => {
						e.stopPropagation();
						onClose();
					}}
					className="absolute top-4 right-8 text-gray-300 hover:text-white transition-colors duration-300 z-40"
				>
					<Close style={{ fontSize: 40 }} />
				</button>

				{/* Image Display */}
				<img
					src={images[currentImageIndex]}
					alt={`Image ${currentImageIndex + 1}`}
					className="md:max-h-[60vh] max-h-[40vh] object-contain mx-auto rounded-lg shadow-lg transition-transform duration-300"
				/>

				{/* Navigation Buttons */}
				<div className="absolute inset-0 flex items-center justify-between px-4">
					<button
						onClick={(e) => {
							e.stopPropagation();
							handlePrev();
						}}
						className="text-gray-300 hover:text-white bg-black bg-opacity-50 p-2 rounded-full transition hover:bg-opacity-75 shadow-lg flex justify-center items-center"
					>
						<ArrowBackIos style={{ fontSize: 30 }} />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleNext();
						}}
						className="text-gray-300 hover:text-white bg-black bg-opacity-50 p-2 rounded-full transition hover:bg-opacity-75 shadow-lg flex justify-center items-center"
					>
						<ArrowForwardIos style={{ fontSize: 30 }} />
					</button>
				</div>

				{/* Image Counter */}
				<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-300 bg-black bg-opacity-50 rounded-full px-4 py-1 text-sm shadow-lg">
					{currentImageIndex + 1} / {images.length}
				</div>
			</div>
		</div>
	);
};

export default Carousel;
