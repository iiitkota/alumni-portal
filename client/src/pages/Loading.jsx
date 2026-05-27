import logo from "../assets/iiitkotalogo.png";

const Loading = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#19194D]">
      <div className="md:w-96 md:h-56 w-72 h-48 bg-white shadow-2xl rounded-xl flex flex-col p-4">
        <div className="w-full h-[80%] flex border-b border-gray-200 pb-4">
          <div className="w-1/2 h-full flex justify-center items-center">
            <img src={logo} className="md:w-36 md:h-36 w-24 h-24" alt="logo" loading='eager' />
          </div>
          <div className="w-1/2 h-full flex flex-col justify-center items-start pl-4">
            <h1 className="md:text-2xl text-lg font-bold text-gray-800">Alumni Cell,</h1>
            <h2 className="md:text-2xl text-lg font-bold text-gray-800">IIIT Kota</h2>
          </div>
        </div>
        <div className="w-full h-[20%] flex justify-center items-center gap-2 pt-4">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-xl font-semibold text-gray-700">Loading</h1>
        </div>
      </div>
    </div>
  );
};

export default Loading;
