import  { memo } from 'react';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import Avatar from "../assets/avatar.png"

const AlumniCard = ({ alumniData, onOpenImage }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${alumniData._id}`);
  };

  if (!alumniData) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  const getLowQualityImageUrl = (url) => {
    if (!url) return Avatar;
    const parts = url.split('/upload/');
    return `${parts[0]}/upload/w_160,h_160,c_fill,f_auto,q_auto/${parts[1]}`;
  };

  return (
    <>
      <div className="bg-white h-48 p-4 rounded-lg shadow-lg transition-shadow duration-300 ease-in-out flex gap-4">
        <div className='w-1/3 flex flex-col items-center justify-center'>
          <div className='w-24 h-24 border border-teal-500 rounded-full overflow-hidden flex items-center justify-center cursor-pointer shadow-md' onClick={() => onOpenImage?.(alumniData.profilePicture || Avatar)}>
            <img src={getLowQualityImageUrl(alumniData.profilePicture)} alt="Profile" loading="lazy" width={96} height={96} className='w-full h-full object-cover' />
          </div>
          <div className='mt-4 flex w-full gap-1'>
            <a href={`/profile/${alumniData._id}`} rel="noopener noreferrer" className='w-full flex justify-center' onClick={handleProfileClick}>
              <button className='flex items-center justify-center w-full rounded-lg h-10 bg-teal-600 hover:bg-teal-500  text-white'>
                <PersonIcon />
              </button>
            </a>
          </div>
        </div>
        <div className='w-2/3 flex flex-col justify-center gap-1 px-4'>
          <div className='text-xl font-semibold text-gray-800'>{alumniData.name}</div>
          <div className='text-sm text-gray-700'>{alumniData.instituteId}</div>
          <div className='text-sm text-gray-700'>{alumniData.branch}, {alumniData.graduationYear}</div>
          <div className='text-sm text-gray-700'>{alumniData.city}</div>
        </div>
      </div>
    </>
  );
};

const areEqual = (prevProps, nextProps) => {
  const prev = prevProps.alumniData;
  const next = nextProps.alumniData;
  if (prev === next) return true;
  if (!prev || !next) return false;
  return (
    prev._id === next._id &&
    prev.name === next.name &&
    prev.instituteId === next.instituteId &&
    prev.branch === next.branch &&
    prev.graduationYear === next.graduationYear &&
    prev.role === next.role &&
    prev.currentCompany === next.currentCompany &&
    prev.city === next.city &&
    prev.profilePicture === next.profilePicture &&
    prev.linkedin === next.linkedin
  );
};

export default memo(AlumniCard, areEqual);