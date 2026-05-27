import Navbar from "../components/navbar.jsx";

const SignInPrompt = () => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-100 to-blue-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl lg:text-5xl font-bold text-[#19194D] text-center">
          Welcome to the Alumni Portal
        </h1>
        <p className="text-lg lg:text-xl text-gray-700 text-center max-w-2xl px-4">
          To access exclusive features, connect with alumni, and explore opportunities, please sign in to your account.
        </p>
        <a
          href="/signin"
          className="mt-6 px-8 py-3 bg-[#19194D] text-white rounded-lg shadow-lg hover:bg-blue-950 transition-colors duration-300 ease-in-out font-semibold text-lg"
        >
          Sign In
        </a>
      </div>
    </div>
  );
};

export default SignInPrompt;