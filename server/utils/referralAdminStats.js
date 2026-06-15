const getAlumniReferralLookupStages = () => [
  {
    $lookup: {
      from: 'referralrequests',
      localField: '_id',
      foreignField: 'alumni',
      as: '_referrals'
    }
  },
  {
    $addFields: {
      totalRequestsReceived: { $size: '$_referrals' },
      referralStats: {
        accepted: {
          $size: {
            $filter: {
              input: '$_referrals',
              as: 'r',
              cond: { $eq: ['$$r.status', 'accepted'] }
            }
          }
        },
        rejected: {
          $size: {
            $filter: {
              input: '$_referrals',
              as: 'r',
              cond: { $eq: ['$$r.status', 'declined'] }
            }
          }
        }
      }
    }
  },
  { $project: { _referrals: 0 } }
];

const getStudentReferralLookupStages = () => [
  {
    $lookup: {
      from: 'referralrequests',
      localField: '_id',
      foreignField: 'student',
      as: '_referrals'
    }
  },
  {
    $addFields: {
      totalReferralRequestsSent: { $size: '$_referrals' },
      referralStats: {
        accepted: {
          $size: {
            $filter: {
              input: '$_referrals',
              as: 'r',
              cond: { $eq: ['$$r.status', 'accepted'] }
            }
          }
        },
        rejected: {
          $size: {
            $filter: {
              input: '$_referrals',
              as: 'r',
              cond: { $eq: ['$$r.status', 'declined'] }
            }
          }
        }
      }
    }
  },
  { $project: { _referrals: 0, password: 0, otp: 0, otpExpires: 0 } }
];

const getAlumniSortStage = (sortBy) => {
  switch (sortBy) {
    case 'mostReferrals':
      return { totalRequestsReceived: -1, name: 1 };
    case 'mostAccepted':
      return { 'referralStats.accepted': -1, name: 1 };
    case 'mostRejected':
      return { 'referralStats.rejected': -1, name: 1 };
    default:
      return { name: 1 };
  }
};

const getStudentSortStage = (sortBy) => {
  switch (sortBy) {
    case 'mostReferrals':
      return { totalReferralRequestsSent: -1, name: 1 };
    case 'mostAccepted':
      return { 'referralStats.accepted': -1, name: 1 };
    case 'mostRejected':
      return { 'referralStats.rejected': -1, name: 1 };
    default:
      return { name: 1 };
  }
};

module.exports = {
  getAlumniReferralLookupStages,
  getStudentReferralLookupStages,
  getAlumniSortStage,
  getStudentSortStage
};
