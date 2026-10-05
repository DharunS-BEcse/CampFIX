const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  upvoteCount: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure upvoteCount is updated before saving
issueSchema.pre('save', function() {
  if (this.upvotes) {
    this.upvoteCount = this.upvotes.length;
  }
});

module.exports = mongoose.model('Issue', issueSchema);
