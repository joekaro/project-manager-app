import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project'
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['team_leader', 'member'],
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  token: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;