const Alumni = require('../models/User');
const ReferralRequest = require('../models/ReferralRequest');

/**
 * Picks an eligible alumni for referral based on currentCompany and weekly limits.
 * Uses a queue-based rotation system.
 *
 * @param {string} company - Target company name
 * @param {string} studentId - ID of the requesting student
 * @returns {Promise<Object|null>} Picked alumni document or null
 */
async function pickAlumni(company, studentId) {
  const alumniList = await Alumni.find({
    currentCompany: { $regex: company, $options: 'i' },
    $expr: {
      $lt: [
        { $ifNull: ['$referralsReceivedThisWeek', 0] },
        { $ifNull: ['$weeklyReferralLimit', 5] }
      ]
    }
  });

  const pendingRequests = await ReferralRequest.find({
    student: studentId,
    status: 'pending'
  });
  const pendingAlumniIds = new Set(pendingRequests.map((req) => req.alumni.toString()));

  const eligibleAlumni = alumniList.filter(
    (alumni) => !pendingAlumniIds.has(alumni._id.toString())
  );

  if (eligibleAlumni.length === 0) {
    return null;
  }

  eligibleAlumni.sort((a, b) => {
    const indexA = a.referralQueueIndex !== undefined ? a.referralQueueIndex : 0;
    const indexB = b.referralQueueIndex !== undefined ? b.referralQueueIndex : 0;
    return indexA - indexB;
  });

  const pickedAlumni = eligibleAlumni[0];

  const updatedAlumni = await Alumni.findByIdAndUpdate(
    pickedAlumni._id,
    { $inc: { referralQueueIndex: 1 } },
    { new: true }
  );

  return updatedAlumni;
}

module.exports = pickAlumni;
