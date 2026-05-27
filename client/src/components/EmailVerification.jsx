import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EmailVerification = ({ instituteId, personalEmail, onVerificationComplete }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);

  const handleRequestCode = async () => {
    try {
      setLoading(true);
      const response = await axios.post('https://alumni-api.iiitkota.ac.in/api/verification/request-code', {
        instituteId,
        personalEmail
      });
      setCodeSent(true);
      setIsExistingUser(response.data.isExistingUser);
      toast.success('Verification code sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      const response = await axios.post('https://alumni-api.iiitkota.ac.in/api/verification/verify-code', {
        instituteId,
        code: verificationCode
      });
      
      if (response.data.verified) {
        toast.success('Email verified successfully');
        onVerificationComplete(response.data.isExistingUser);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* <h2 className="text-2xl font-bold text-[#19194D] mb-6">Email Verification</h2> */}
      
      {!codeSent ? (
        <button
          onClick={handleRequestCode}
          disabled={loading}
          className="px-6 py-2 bg-[#0E407C] text-white rounded-lg hover:bg-[#19194D] transition-colors"
        >
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>
      ) : (
        <div className="w-full max-w-md">
          {isExistingUser && (
            <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
              <p className="text-sm">
                We found an existing account with this Institute ID. 
                This verification will update your account information.
              </p>
            </div>
          )}
          <div className="mb-4">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit verification code"
              className="w-full px-4 py-3 border border-[#0E407C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E407C]"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className="flex-1 px-6 py-2 bg-[#0E407C] text-white rounded-lg hover:bg-[#19194D] transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              onClick={handleRequestCode}
              disabled={loading}
              className="px-6 py-2 border border-[#0E407C] text-[#0E407C] rounded-lg hover:bg-[#0E407C] hover:text-white transition-colors"
            >
              Resend Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailVerification; 