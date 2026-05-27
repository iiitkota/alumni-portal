const Alumni = require('../models/User');
const ReferralRequest = require('../models/ReferralRequest');

/**
 * Picks an eligible alumni for referral based on company, role, and weekly limits.
 * Uses a queue-based rotation system.
 * 
 * @param {string} company - Name of the company
 * @param {string} role - Job role
 * @param {string} studentId - ID of the requesting student
 * @returns {Promise<Object|null>} Picked alumni document or null
 */
async function pickAlumni(company, role, studentId) {
  // 1. Find all alumni who match company and role, and haven't exceeded weekly referral limit
  const alumniList = await Alumni.find({
    currentCompany: { $regex: company, $options: 'i' },
    role: { $regex: role, $options: 'i' },
    $expr: {
      $lt: [
        { $ifNull: ["$referralsReceivedThisWeek", 0] },
        { $ifNull: ["$weeklyReferralLimit", 5] }
      ]
    }
  });

  // 2. Find pending requests from this student to any alumni
  const pendingRequests = await ReferralRequest.find({
    student: studentId,
    status: 'pending'
  });
  const pendingAlumniIds = new Set(pendingRequests.map(req => req.alumni.toString()));

  // 3. Filter out alumni who already have a pending referral request from this student
  const eligibleAlumni = alumniList.filter(alumni => !pendingAlumniIds.has(alumni._id.toString()));

  // 4. If no eligible alumni remain, return null
  if (eligibleAlumni.length === 0) {
    return null;
  }

  // 5. Sort the remaining alumni by referralQueueIndex ascending
  eligibleAlumni.sort((a, b) => {
    const indexA = a.referralQueueIndex !== undefined ? a.referralQueueIndex : 0;
    const indexB = b.referralQueueIndex !== undefined ? b.referralQueueIndex : 0;
    return indexA - indexB;
  });

  // 6. Pick the first one (lowest index = next in rotation)
  const pickedAlumni = eligibleAlumni[0];

  // 7. Increment that alumni's referralQueueIndex by 1 using findByIdAndUpdate
  const updatedAlumni = await Alumni.findByIdAndUpdate(
    pickedAlumni._id,
    { $inc: { referralQueueIndex: 1 } },
    { new: true }
  );

  // 8. Return the picked alumni document
  return updatedAlumni;
}

module.exports = pickAlumni;
