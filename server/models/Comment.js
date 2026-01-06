import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;