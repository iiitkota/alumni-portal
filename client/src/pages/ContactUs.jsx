// src/pages/ContactUs.jsx
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { TextField, Checkbox, Button, FormControlLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Box, Typography } from "@mui/material";
import emailjs from "@emailjs/browser";
import { toast, Toaster } from "react-hot-toast"; 

const ContactUs = () => {
	const form = useRef();
	const [agree, setAgree] = useState(false);
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			setOpen(true);
		}
	}, []);

	const handleClose = () => setOpen(false);
	const handleSignIn = () => {
		setOpen(false);
		navigate("/signin");
	};

	const handleChange = (e) => {
		setAgree(e.target.checked);
	};

	const sendEmail = (e) => {
		e.preventDefault();

		const token = localStorage.getItem("token");
		if (!token) {
			toast.error("You must be signed in to submit the form.");
			return;
		}

		if (!agree) {
			toast.error("You must agree to share your information.");
			return;
		}

		const formData = new FormData(form.current);
		const isEmpty = Array.from(formData.values()).some(value => !value.trim());

		if (isEmpty) {
			toast.error("All fields must be filled out.");
			return;
		}

		emailjs
			.sendForm(
				"service_wey3wx7",
				"template_346rsgh",
				form.current,
				"DXrpGBTFte2R1jdAq"
			)
			.then(
				() => {
					toast.success("Message Delivered!");
					form.current.reset(); 
				},
				(error) => {
					// console.log("FAILED...", error.text);
					toast.error("Email sending failed!");
				}
			);
	};

	return (
		<div className="w-full h-full overflow-x-hidden custom-scrollbar bg-gray-100">
			<Toaster position="top-right" /> 
			<Navbar />
				<Modal
					open={open}
					onClose={handleClose}
					aria-labelledby="signin-modal-title"
					aria-describedby="signin-modal-description"
				>
					<Box className="bg-white p-6 rounded shadow-lg w-80 mx-auto mt-24"
						sx={{
							position: 'absolute',
							top: '35%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
						}}
					>
						<Typography id="signin-modal-title" variant="h6" component="h2" className="mb-4">
							Not Signed In
						</Typography>
						<Typography id="signin-modal-description" className="mb-6">
							You must be signed in to fill out the contact form.
						</Typography>
						<div className="flex justify-end gap-4">
							<Button onClick={handleClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
								Close
							</Button>
							<Button onClick={handleSignIn} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
								Sign In
							</Button>
						</div>
					</Box>
				</Modal>
			<div className="flex justify-center items-center w-full h-[150vh] md:h-[80vh] mt-[4rem] md:mt-[9rem] md:px-2">
				<div className="w-[98%] h-[98%] bg-white rounded-md shadow-lg flex md:flex-row flex-col p-2 group">
					{/* Left dark blue section with a large ring */}
					<div className="md:w-[40%] w-full md:h-full h-[40%] bg-gradient-to-tr from-blue-700 to-blue-900 rounded-xl relative overflow-hidden">
						<div className="absolute -top-[12rem] md:-top-[22rem] -right-[12rem] md:-right-[22rem] w-[20rem] h-[20rem] md:w-[40rem] md:h-[40rem] border-[2rem] md:border-[4rem] border-blue-700 rounded-full opacity-50 transition-hover duration-[2s] ease-out md:group-hover:-top-[20rem] group-hover:-top-[6rem] group-hover:-right-[6rem] md:group-hover:-right-[20rem]"></div>
						<div className="absolute inset-0 w-full h-full text-white py-12 px-6 space-y-6">
							<h2 className="text-4xl font-bold mb-8">How can we help you?</h2>
							<div className="flex items-center text-xl mb-3">
								<PhoneIcon fontSize="large" />{" "}
								<span className="ml-3">9549650234</span>
							</div>
							<div className="flex items-center text-xl mb-3">
								<EmailIcon fontSize="large" />{" "}
								<span className="ml-3">alumni@iiitkota.ac.in</span>
							</div>
							<div className="flex items-center text-xl">
								<LocationOnIcon fontSize="large" />{" "}
								<span className="ml-3">IIIT Kota, Kota, Rajasthan</span>
							</div>
						</div>
					</div>

					{/* Right side for form */}
					<div className="md:w-[60%] w-full md:h-full h-[60%] md:p-4 flex flex-col justify-center">
						<form ref={form} onSubmit={sendEmail} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<TextField
									label="Name"
									name="user_name" 
									fullWidth
									variant="outlined"
								/>
								<TextField
									label="Branch"
									name="batch" 
									fullWidth
									variant="outlined"
								/>
								<TextField
									label="Graduation Year"
									name="graduationYear"
									fullWidth
									variant="outlined"
								/>
								<TextField
									label="College ID"
									name="collegeId"
									fullWidth
									variant="outlined"
								/>
							</div>
							<TextField
								label="Phone Number"
								name="phoneNumber"
								fullWidth
								variant="outlined"
							/>
							<TextField
								label="Email"
								name="user_email" 
								type="email"
								fullWidth
								variant="outlined"
							/>
							<TextField
								label="Message"
								name="message"
								fullWidth
								multiline
								rows={4}
								variant="outlined"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={agree}
										onChange={handleChange}
										name="agree"
										color="primary"
									/>
								}
								label="I agree to share the above information for the contact."
							/>
							{/* +91 70151 67270 */}
							<Button
								type="submit"
								variant="contained"
								color="primary"
								disabled={!agree}
								fullWidth
							>
								Submit
							</Button>
						</form>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default ContactUs;
