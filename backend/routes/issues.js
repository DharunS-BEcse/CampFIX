const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @route   GET /api/issues
// @desc    Get all issues sorted by priority (upvoteCount)
// @access  Public or Private (depending on your need, we'll make it Private)
router.get('/', auth, async (req, res) => {
  try {
    const issues = await Issue.find().populate('reportedBy', 'name').sort({ upvoteCount: -1, createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error('Issue Create Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   POST /api/issues
// @desc    Create a new issue
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, location } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      imageUrl = req.file.path; // URL from Cloudinary
    }

    const newIssue = new Issue({
      title,
      description,
      location,
      imageUrl,
      reportedBy: req.user.id
    });

    const issue = await newIssue.save();
    res.json(issue);
  } catch (err) {
    console.error('Issue Create Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   PUT /api/issues/:id/upvote
// @desc    Upvote an issue
// @access  Private
router.put('/:id/upvote', auth, async (req, res) => {
  try {
    let issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Check if user already upvoted
    if (issue.upvotes.includes(req.user.id)) {
      // Remove upvote (toggle)
      issue.upvotes = issue.upvotes.filter(userId => userId.toString() !== req.user.id);
    } else {
      // Add upvote
      issue.upvotes.push(req.user.id);
    }

    await issue.save();
    res.json(issue);
  } catch (err) {
    console.error('Issue Create Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   PUT /api/issues/:id/status
// @desc    Update issue status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const { status } = req.body;
    let issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = status;
    await issue.save();
    res.json(issue);
  } catch (err) {
    console.error('Issue Create Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
