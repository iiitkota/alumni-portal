
const express = require('express');
const router = express.Router();

const rateLimit = require('express-rate-limit');

const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const Alumni = require('../models/User');
const News = require('../models/News');

const path = require('path')
const Event = require("../models/Event");

const fs = require('fs')
const upload = require("../middlewares/upload");
const { v4: uuidv4 } = require('uuid');  
const renameFilesWithPostId = require("../utils/renameFilesWithPostId");



const verifyAdmin = require("../middlewares/verifyAdmin");
const Student = require('../models/Student');
const {
  getAlumniReferralLookupStages,
  getStudentReferralLookupStages,
  getAlumniSortStage,
  getStudentSortStage
} = require('../utils/referralAdminStats');

const ADMIN_KEY_HASH = process.env.ADMIN_KEY_HASH;
const ADMINSECRET = process.env.ADMINSECRET  ;
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

if (!ADMIN_KEY_HASH || !ADMINSECRET) {
    throw new Error("FATAL ERROR: Required environment variables are not set.");
}

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per 15 minutes
    message: { success: false, message: 'Too many login attempts. Please try again later.' },
    standardHeaders: true, 
    legacyHeaders: false, 
});


// api/admin/login
router.post("/login",  async (req,res)=>{

  
  const {key} = req.body;

  if (!key) {
    return res.status(400).json({ success: false, message: "Key is required" });
  }


  const isMatch = await bcrypt.compare(key, ADMIN_KEY_HASH);

  if (isMatch) {
    const token = jwt.sign({ access: true }, ADMINSECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === 'production', // IMPORTANT: set to true in production
      maxAge: TOKEN_EXPIRY_MS
    });

    return res.json({ success: true });
  }

  return res.status(401).json({ success: false, message: "Invalid key" });
})



router.get("/protected", verifyAdmin, (req, res) => {
  res.json({ access: true });
});


router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});



// POST /api/admin/eventposts
router.post("/eventposts", verifyAdmin, upload.array("images"), async (req, res) => {
  try {
    const { title, description, details, date } = req.body;

    const images = req.files ? req.files.map((file) => ({
      uid: uuidv4(),
      path: `/uploads/events/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    })) : [];

    const eventPost = new Event({
      title,
      description,
      details,
      date,
      images,
    });

    await eventPost.save();

    // console.log(eventPost._id)

    // Rename files if they were initially saved with a temp name

    try {
      if (req.files && req.files.length && req.files.some(f => f.filename.includes("temp_"))) {
        await renameFilesWithPostId(eventPost._id, req.files, eventPost.images);
      }

    } catch (error) {
      // console.log("error here bruh", error)
    }

    res.status(201).json(eventPost);
  } catch (error) {
    res.status(400).json({ error: error.message }); 
  }
});




router.get("/eventposts",  async (req, res) => {
  try {
    const { page = 1, limit = 10, title, description, details, date } = req.query;

    const filter = {};

    if (title) filter.title = { $regex: title, $options: 'i' };
    if (description) filter.description = { $regex: description, $options: 'i' };
    if (details) filter.details = { $regex: details, $options: 'i' };
    if (date) filter.date = new Date(date); // optional: use $gte/$lte for date range

    const events = await Event.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(filter);

    res.json({ total, page: parseInt(page), events });
  } catch (err) {
    console.error("Failed to fetch event posts", err);
    res.status(500).json({ error: "Failed to fetch event posts" });
  }
});
 


router.put('/eventposts/:id', verifyAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, details, date, deletedImages } = req.body;


    // console.log("files:", req.files, "deleted: ",  deletedImages)

    const post = await Event.findById(id);
    if (!post) return res.status(404).json({ message: 'Event post not found' });

    // Update text fields
    post.title = title;
    post.description = description;
    post.details = details;
    post.date = date;

    // Delete images if requested
    if (deletedImages) {
      const toDelete = JSON.parse(deletedImages);
        // console.log("Deleting images:", toDelete);
      post.images = post.images.filter(img => {
        if (toDelete.includes(img.uid)) {
          const filePath = path.join(__dirname, '..', img.path);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          return false;
        }
        return true;
      });
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImgs = req.files.map(file => ({
        filename: file.filename,
        path: '/' +  file.path.replace(/\\/g, '/'),
        uid: file.filename,
      }));
      post.images.push(...newImgs);
    }

    await post.save();
    res.json({ message: 'Event post updated', post });

  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/eventposts/:id
router.delete('/eventposts/:id', verifyAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event post not found' });

    // Delete associated image files from disk
 

    if (event.images && event.images.length > 0) {
      for (const img of event.images) {
        const filePath = path.join(__dirname, '..', img.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

 

    await Event.findByIdAndDelete(eventId);

    res.json({ message: 'Event post deleted successfully' });
  } catch (error) {
    console.error('Error deleting event post:', error);
    res.status(500).json({ error: 'Failed to delete event post' });

    // console.log(error)
  }
});












//  Fetch the news
router.get('/news',  async (req, res) => {

  try {

    const { page = 1, limit, title, content, postedOn } = req.query;
    const filter = {};

    if (title) filter.title = { $regex: title, $options: 'i' }
    if (content) filter.content = { $regex: content, $options: 'i' };
    // if (postedOn) filter.postedOn = { $regex: postedOn, $options: 'i' }

    if (postedOn) {
      const date = new Date(postedOn);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      filter.postedOn = { $gte: date, $lt: nextDate };
    }

    const skip = (page - 1) * limit;

    const news = await News.find(filter)
    .sort({postedOn:-1})
      .select('title content postedOn')
      .skip(skip)
      .limit(Number(limit))


    const totalCount = await News.countDocuments(filter);

    const totalPages = Math.ceil(totalCount / limit);




    res.json({
      news, totalCount, totalPages, currentPage: Number(page),
    })


  } catch (error) {
    console.error('Error fetching news')
  }

})

// Add new Posts in the news collection
router.post('/news', verifyAdmin, async (req, res) => {
  try {
    const { title, content, postedOn } = req.body;

    // Basic validation
    if (!title || !content || !postedOn) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newPost = new News({
      title,
      content,
      postedOn: new Date(postedOn) // Ensure this is a Date object
    });

    await newPost.save();

    res.status(201).json({ message: 'News post created', news: newPost });
  } catch (error) {
    console.error('Error saving news:', error);
    res.status(500).json({ message: 'Server error while creating news' });
  }
});


// Update News by ID
router.put("/news/:id", verifyAdmin, async (req, res) => {


  try {
    const newsId = req.params.id;
    const updateData = req.body;


    const updatedNews = await News.findByIdAndUpdate(
      newsId,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedNews) {
      return res.status(404).json({ error: "News not found" });
    }


    res.json({ message: "News updated successfully", news: updatedNews })

  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
})

// Delete news by id

router.delete('/news/:id', verifyAdmin, async (req, res) => {
  try {
    const newsId = req.params.id;
    const deletedNews = await News.findByIdAndDelete(newsId);

    if (!deletedNews) {
      return res.status(404).json({ error: 'News not found' });

    }
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
})







//  Fetch Alumni
router.get('/alumni', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      instituteId,
      graduationYear,
      company,
      role,
      branch,
      city,
      sortBy
    } = req.query;

    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (instituteId) filter.instituteId = { $regex: instituteId, $options: 'i' };
    if (graduationYear) filter.graduationYear = graduationYear;
    if (company) filter.currentCompany = { $regex: company, $options: 'i' };
    if (role) filter.role = { $regex: role, $options: 'i' };
    if (branch) filter.branch = { $regex: branch, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);

    const pipeline = [
      { $match: filter },
      ...getAlumniReferralLookupStages(),
      { $sort: getAlumniSortStage(sortBy) },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          name: 1,
          profilePicture: 1,
          linkedin: 1,
          instituteId: 1,
          branch: 1,
          graduationYear: 1,
          role: 1,
          currentCompany: 1,
          city: 1,
          state: 1,
          country: 1,
          personalEmail: 1,
          phoneNumber: 1,
          pastCompanies: 1,
          achievements: 1,
          totalRequestsReceived: 1,
          referralStats: 1
        }
      }
    ];

    const [alumni, totalCount, graduationYears] = await Promise.all([
      Alumni.aggregate(pipeline),
      Alumni.countDocuments(filter),
      Alumni.distinct('graduationYear', filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.json({
      alumni,
      totalCount,
      totalPages,
      currentPage: Number(page),
      graduationYears
    });
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ error: 'Failed to fetch alumni data' });
  }
});

// Fetch Students (admin)
router.get('/students', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      instituteId,
      graduationYear,
      branch,
      sortBy
    } = req.query;

    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (instituteId) filter.instituteId = { $regex: instituteId, $options: 'i' };
    if (graduationYear) filter.graduationYear = graduationYear;
    if (branch) filter.branch = { $regex: branch, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);

    const pipeline = [
      { $match: filter },
      ...getStudentReferralLookupStages(),
      { $sort: getStudentSortStage(sortBy) },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          name: 1,
          instituteId: 1,
          personalEmail: 1,
          branch: 1,
          graduationYear: 1,
          linkedin: 1,
          phoneNumber: 1,
          currentYear: 1,
          isVerified: 1,
          totalReferralRequestsSent: 1,
          referralStats: 1
        }
      }
    ];

    const [students, totalCount, graduationYears] = await Promise.all([
      Student.aggregate(pipeline),
      Student.countDocuments(filter),
      Student.distinct('graduationYear', filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.json({
      students,
      totalCount,
      totalPages,
      currentPage: Number(page),
      graduationYears
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch student data' });
  }
});



// UPDATE alumni by ID
router.put('/alumni/:id', verifyAdmin, async (req, res) => {
  try {
    const alumnusId = req.params.id;
    const updateData = req.body;

    // Optional: validate updateData here if needed

    const updatedAlumnus = await Alumni.findByIdAndUpdate(
      alumnusId,
      updateData,
      { new: true, runValidators: true } // return updated doc and run schema validators
    );

    if (!updatedAlumnus) {
      return res.status(404).json({ error: 'Alumnus not found' });
    }

    res.json({ message: 'Alumnus updated successfully', alumnus: updatedAlumnus });
  } catch (error) {
    console.error('Error updating alumnus:', error);
    res.status(500).json({ error: 'Failed to update alumnus' });
  }
});


// DELETE alumni by ID
router.delete('/alumni/:id', verifyAdmin, async (req, res) => {
  try {
    const alumnusId = req.params.id;

    const deletedAlumnus = await Alumni.findByIdAndDelete(alumnusId);

    if (!deletedAlumnus) {
      return res.status(404).json({ error: 'Alumnus not found' });
    }

    res.json({ message: 'Alumnus deleted successfully' });
  } catch (error) {
    console.error('Error deleting alumnus:', error);
    res.status(500).json({ error: 'Failed to delete alumnus' });
  }
});

const multer = require('multer');
const adminBlogController = require('../controllers/adminBlogController');

const blogCoverUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed for cover images'), false);
  }
});

router.get('/blogs/authors', verifyAdmin, adminBlogController.searchAuthors);
router.get('/blogs/tags', verifyAdmin, adminBlogController.getBlogTags);
router.get('/blogs', verifyAdmin, adminBlogController.listBlogs);
router.get('/blogs/:id', verifyAdmin, adminBlogController.getBlogById);
router.post('/blogs', verifyAdmin, blogCoverUpload.single('coverImage'), adminBlogController.createBlog);
router.put('/blogs/:id', verifyAdmin, blogCoverUpload.single('coverImage'), adminBlogController.updateBlog);
router.delete('/blogs/:id', verifyAdmin, adminBlogController.deleteBlog);

module.exports = router

