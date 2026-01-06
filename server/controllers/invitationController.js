import Invitation from '../models/Invitation.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import crypto from 'crypto';

// @desc    Send invitation
// @route   POST /api/invitations
export const sendInvitation = async (req, res) => {
  try {
    const { projectId, email, role } = req.body;

    // Check if project exists and user has permission
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or team leader
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isTeamLeader = project.teamLeader && project.teamLeader.toString() === req.user._id.toString();

    if (!isOwner && !isTeamLeader) {
      return res.status(401).json({ message: 'Not authorized to send invitations' });
    }

    // Team leaders can only invite members, not other team leaders
    if (isTeamLeader && !isOwner && role === 'team_leader') {
      return res.status(401).json({ message: 'Only project managers can invite team leaders' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(404).json({ message: 'No user found with this email. Please ask them to register first.' });
    }

    // Check if user is already a member
    if (project.members.some(m => m.toString() === userExists._id.toString())) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      project: projectId,
      email,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent to this user' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = await Invitation.create({
      project: projectId,
      email,
      role,
      invitedBy: req.user._id,
      token
    });

    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate('project', 'name description')
      .populate('invitedBy', 'name email');

    res.status(201).json(populatedInvitation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get invitations for logged in user
// @route   GET /api/invitations
export const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      email: req.user.email,
      status: 'pending'
    })
      .populate('project', 'name description')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get invitations for a project
// @route   GET /api/invitations/project/:projectId
export const getProjectInvitations = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or team leader
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isTeamLeader = project.teamLeader && project.teamLeader.toString() === req.user._id.toString();

    if (!isOwner && !isTeamLeader) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const invitations = await Invitation.find({
      project: req.params.projectId
    })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept invitation
// @route   PUT /api/invitations/:id/accept
export const acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('project');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if invitation belongs to user
    if (invitation.email !== req.user.email) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Add user to project
    const project = await Project.findById(invitation.project._id);
    
    if (invitation.role === 'team_leader') {
      project.teamLeader = req.user._id;
    }
    
    if (!project.members.includes(req.user._id)) {
      project.members.push(req.user._id);
    }
    
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('teamLeader', 'name email role')
      .populate('members', 'name email role');

    res.json({ invitation, project: updatedProject });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Decline invitation
// @route   PUT /api/invitations/:id/decline
export const declineInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if invitation belongs to user
    if (invitation.email !== req.user.email) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    invitation.status = 'declined';
    await invitation.save();

    res.json(invitation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete invitation
// @route   DELETE /api/invitations/:id
export const deleteInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id).populate('project');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    const project = await Project.findById(invitation.project._id);

    // Check if user is owner or team leader who sent the invitation
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isInviter = invitation.invitedBy.toString() === req.user._id.toString();

    if (!isOwner && !isInviter) {
      return res.status(401).json({ message: 'Not authorized to delete this invitation' });
    }

    await invitation.deleteOne();
    res.json({ message: 'Invitation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};