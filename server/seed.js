require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/alumni-portal';

const hash = (p) => bcrypt.hashSync(p, 10);
const pwd = hash('12345678');

const alumni = [
  {
    name: 'Rahul Meena',
    instituteId: '2017kuec1003',
    branch: 'CSE',
    personalEmail: 'rahul.meena@alumni.iiitkota.ac.in',
    phoneNumber: '9876543201',
    city: 'Bengaluru', state: 'Karnataka', country: 'India',
    graduationYear: '2021',
    currentCompany: 'Zynthorex Technologies',
    role: 'Software Engineer',
    pastCompanies: '',
    achievements: '',
    linkedin: 'https://linkedin.com/in/rahulmeena',
    password: pwd,
    weeklyReferralLimit: 5,
    referralsReceivedThisWeek: 0,
    weeklyLimitResetAt: new Date(),
    referralQueueIndex: 0,
    referralsGivenByMonth: [],
  },
  {
    name: 'Sneha Agarwal',
    instituteId: '2017kuec1004',
    branch: 'ECE',
    personalEmail: '2017kuec1004@alumni.iiitkota.ac.in',
    phoneNumber: '9876543202',
    city: 'Hyderabad', state: 'Telangana', country: 'India',
    graduationYear: '2021',
    currentCompany: 'Zynthorex Technologies',
    role: 'Software Engineer',
    pastCompanies: '',
    achievements: '',
    linkedin: 'https://linkedin.com/in/snehaagarwal',
    password: pwd,
    weeklyReferralLimit: 3,
    referralsReceivedThisWeek: 0,
    weeklyLimitResetAt: new Date(),
    referralQueueIndex: 0,
    referralsGivenByMonth: [],
  }

];

const students = [
  {
    name: 'Arjun Verma',
    instituteId: '2024kucp2020',
    branch: 'CSE',
    personalEmail: '2024kucp2020@iiitkota.ac.in',
    phoneNumber: '9123456701',
    graduationYear: '2028',
    currentYear: 2,
    linkedin: 'https://linkedin.com/in/arjunverma',
    password: pwd,
    isVerified: true,
    role: 'student',
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));

  await User.deleteMany({ instituteId: { $in: ['2017kuec1003', '2017kuec1004', '2017kuec1005'] } });
  await Student.deleteMany({ instituteId: '2024kucp2020' });
  console.log('Cleared old seed data');

  await User.insertMany(alumni);
  console.log(`Seeded ${alumni.length} alumni`);

  await Student.insertMany(students);
  console.log(`Seeded ${students.length} student`);

  console.log('\n--- LOGIN CREDENTIALS (password: 12345678 for all) ---');
  console.log('\nALUMNI');
  alumni.forEach(a => console.log(`  ${a.name.padEnd(20)} | ${a.instituteId} | ${a.currentCompany} | ${a.personalEmail}`));
  console.log('\nSTUDENT');
  students.forEach(s => console.log(`  ${s.name.padEnd(20)} | ${s.instituteId} | ${s.personalEmail}`));
  console.log('\n--- ROUND ROBIN TEST ---');
  console.log('  All 3 alumni are at Zynthorex Technologies / Software Engineer');
  console.log('  Send 3 requests as Arjun → should go to Rahul, Sneha, Vikram in rotation');
  console.log('  (withdraw between requests since one pending per company rule applies)');

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error(err); process.exit(1); });
