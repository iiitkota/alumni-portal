import { useEffect, useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PersonIcon from "@mui/icons-material/Person";
import YoutubeIcon from "@mui/icons-material/YouTube";
import LogoutIcon from "@mui/icons-material/Logout";
import Headroom from "react-headroom";
import Avatar from "../assets/avatar.png"
import axios from "axios";
import { Modal, Box, Button, Typography } from "@mui/material";

let APIHOST = import.meta.env.VITE_API_URL

const TopLayer = () => {
	const [user, setUser] = useState(null);
	const [error, setError] = useState(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [open, setOpen] = useState(false);

	const token = localStorage.getItem("token");

	useEffect(() => {
		if (token) {
			setIsLoggedIn(true);
			const fetchUser = async () => {
				try {
					const response = await axios.get(
						`${APIHOST}/api/profile/me`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					setUser(response.data);
				} catch (error) {
					setError(error.message);
				}
			};
			fetchUser();
		} else {
			setIsLoggedIn(false);
		}
	}, [token]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		setIsLoggedIn(false);
		setUser(null);
		window.location.reload();
	};

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	return (
		<Headroom>
			<div className="relative w-full h-[1.5rem] bg-[#1A1C4E] flex px-16 max-w-980:hidden">
				<div className="h-full w-1/2 flex gap-4 justify-start items-center">
					<a href="/" aria-label="Home">
						<HomeIcon
							className="text-white text-xs hover:cursor-pointer hover:text-[#38B6FF] transition"
							style={{ fontSize: "1.2rem" }}
						/>
					</a>
				</div>
				<div className="h-full w-1/2 flex justify-end items-center gap-2">
					{isLoggedIn && user ? (
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 border border-black rounded-full overflow-hidden">
								{user.profilePicture ? (
									<img
										src={user.profilePicture}
										alt="Profile"
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="bg-gray-400 w-full h-full">
										<img src={Avatar} alt="" className="w-full h-full object-fill" />
									</div>
								)}
							</div>
							<p className="text-white text-sm">
								<a
									href="/profile/me"
									className="hover:underline flex justify-center items-center"
								>
									{user.name}
								</a>
							</p>
							<a
								href="#"
								onClick={handleOpen}
								className="text-white text-xs cursor-pointer"
								aria-label="Logout"
							>
								<LogoutIcon style={{ fontSize: "1.2rem" }} />
							</a>

							<p className="text-white text-sm">
								<a
									href="/admin"
									className="hover:underline flex justify-center items-center"
								>
									Admin
								</a>
							</p>
						</div>
					) : (
						<div className="w-auto h-full flex gap-2">
							<PersonIcon
								className="text-white text-xs"
								style={{ fontSize: "1.2rem" }}
							/>
							<p className="text-white text-sm">
								<a href="/signin">
									<span className="hover:underline hover:cursor-pointer">
										Login
									</span>
								</a>{" "}
								/{" "}
								<a href="/signup">
									<span className="hover:underline hover:cursor-pointer">
										Register
									</span>
								</a>{" "}
								/{" "}
								<a href="/admin">
									<span className="hover:underline hover:cursor-pointer">
										Admin
									</span>
								</a>
							</p>
						</div>
					)}
				</div>
			</div>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="logout-modal-title"
				aria-describedby="logout-modal-description"
			>
				<Box className="bg-white p-6 rounded shadow-lg w-80 mx-auto mt-24"
					sx={{
						position: 'absolute',
						top: '35%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
					}}
				>
					<h2 id="logout-modal-title" className="text-lg font-semibold mb-4">
						Confirm Logout
					</h2>
					<p id="logout-modal-description" className="mb-6">
						Are you sure you want to log out?
					</p>
					<div className="flex justify-end gap-4">
						<button
							onClick={handleClose}
							className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
						>
							Cancel
						</button>
						<button
							onClick={handleLogout}
							className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
						>
							Log Out
						</button>
					</div>
				</Box>
			</Modal>
		</Headroom>
	);
};

export default TopLayer;
