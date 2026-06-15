const ReferralRequest = require('../models/ReferralRequest');
const Alumni = require('../models/User');
const Student = require('../models/Student');
const pickAlumni = require('../utils/pickAlumni');
const { sendReferralNotificationEmail } = require('../utils/emailUtil');

async function assignReferralRequest({
  studentId,
  company,
  message,
  resumeUrl,
  resumePublicId,
  jobLink,
  jobId
}) {
  const alumni = await pickAlumni(company, studentId);

  if (!alumni) {
    return { alumni: null, referralRequest: null };
  }

  const referralRequest = new ReferralRequest({
    student: studentId,
    alumni: alumni._id,
    company,
    message: message || '',
    resumeUrl,
    resumePublicId,
    ...(jobLink && { jobLink }),
    ...(jobId && { jobId })
  });

  await referralRequest.save();

  await Alumni.findByIdAndUpdate(alumni._id, {
    $inc: { referralsReceivedThisWeek: 1 }
  });

  try {
    const student = await Student.findById(studentId).select('name');
    const dashboardBaseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://alumni.iiitkota.ac.in';
    const dashboardUrl = `${dashboardBaseUrl.replace(/\/$/, '')}/referral-inbox`;

    await sendReferralNotificationEmail({
      alumniEmail: alumni.personalEmail,
      alumniName: alumni.name,
      studentName: student?.name || 'Student',
      company,
      jobLink,
      jobId,
      studentMessage: message,
      resumeUrl,
      dashboardUrl
    });

    console.log(`[Referral Assignment] Notification email sent successfully to ${alumni.personalEmail} for request ${referralRequest._id}`);
  } catch (emailError) {
    console.error(
      `[Referral Assignment] Failed to send notification email for request ${referralRequest._id}:`,
      emailError.message || emailError
    );
  }

  return { alumni, referralRequest };
}

module.exports = {
  assignReferralRequest
};
