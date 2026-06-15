const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Alumni = require('../models/User');
const Student = require('../models/Student');
const ReferralRequest = require('../models/ReferralRequest');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || process.env.MAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.MAIL_PASS,
  },
});

// 1. Weekly limit reset — every Monday at 00:00
cron.schedule('0 0 * * 1', async () => {
  try {
    await Alumni.updateMany({}, {
      $set: {
        referralsReceivedThisWeek: 0,
        weeklyLimitResetAt: new Date()
      }
    });
    console.log('[CRON] Weekly referral limits reset');
  } catch (error) {
    console.error('[CRON] Error resetting weekly referral limits:', error);
  }
});

// 2. Student to alumni migration — every day at 02:00
cron.schedule('0 2 * * *', async () => {
  try {
    const students = await Student.find({});
    const now = new Date();

    for (const student of students) {
      if (!student.graduationYear) continue;

      const gradDate = new Date(`${student.graduationYear}-07-31`);
      
      if (now > gradDate) {
        try {
          // Check if Alumni already exists with same personalEmail
          const existingAlumni = await Alumni.findOne({ personalEmail: student.personalEmail });
          
          if (existingAlumni) {
            // Delete student doc and continue
            await Student.findByIdAndDelete(student._id);
            continue;
          }

          // Create Alumni doc
          const alumni = new Alumni({
            name: student.name,
            instituteId: student.instituteId,
            branch: student.branch,
            personalEmail: student.personalEmail,
            phoneNumber: student.phoneNumber,
            graduationYear: student.graduationYear,
            password: student.password,
            profilePicture: student.profilePicture,
            profilePicturePublicId: student.profilePicturePublicId,
            linkedin: student.linkedin,
            role: 'alumni',
            currentCompany: 'Not updated',
            city: 'Not updated',
            state: 'Not updated',
            country: 'Not updated',
            weeklyReferralLimit: 5,
            referralsReceivedThisWeek: 0,
            weeklyLimitResetAt: new Date(),
            referralQueueIndex: 0,
            achievements: '',
            pastCompanies: ''
          });

          await alumni.save();
          await Student.findByIdAndDelete(student._id);

          // Send welcome email
          const mailOptions = {
            from: process.env.EMAIL_USER || process.env.MAIL_USER,
            to: student.personalEmail,
            subject: 'Welcome to the IIIT Kota Alumni Network!',
            text: `Hi ${student.name}, you have been automatically added to the alumni portal as you have completed 4 years since your graduation year. Please log in and update your current company, role, and location.`
          };

          await transporter.sendMail(mailOptions);
          console.log(`[CRON] Migrated: ${student.personalEmail}`);
        } catch (err) {
          console.error(`[CRON] Error migrating student ${student.personalEmail}:`, err);
        }
      }
    }
  } catch (error) {
    console.error('[CRON] Error during student to alumni migration:', error);
  }
});

// 3. Monthly stats rollup — 1st of every month at 03:00
cron.schedule('0 3 1 * *', async () => {
  try {
    const targetDate = new Date();
    // Move to last month
    targetDate.setMonth(targetDate.getMonth() - 1);
    
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const lastMonthKey = `${year}-${month}`;

    const startOfLastMonth = new Date(year, targetDate.getMonth(), 1, 0, 0, 0, 0);
    const endOfLastMonth = new Date(year, targetDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const stats = await ReferralRequest.aggregate([
      {
        $match: {
          status: 'accepted',
          respondedAt: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth
          }
        }
      },
      {
        $group: {
          _id: '$alumni',
          count: { $sum: 1 }
        }
      }
    ]);

    for (const stat of stats) {
      if (!stat._id) continue;
      
      await Alumni.findByIdAndUpdate(stat._id, {
        $push: {
          referralsGivenByMonth: {
            month: lastMonthKey,
            count: stat.count
          }
        }
      });
    }

    console.log(`[CRON] Monthly stats logged for ${lastMonthKey}`);
  } catch (error) {
    console.error('[CRON] Error calculating monthly stats rollup:', error);
  }
});

module.exports = {};
