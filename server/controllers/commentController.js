import Comment from '../models/Comment.js';
import Project from '../models/Project.js';

// @desc    Get comments for a project
// @route   GET /api/comments/project/:projectId
export const getProjectComments = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a member of the project
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(401).json({ message: 'Not authorized to view comments' });
    }

    const comments = await Comment.find({ project: req.params.projectId })
      .populate('user', 'name email role')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create comment
// @route   POST /api/comments
export const createComment = async (req, res) => {
  try {
    const { projectId, text, imageUrl } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a member of the project
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(401).json({ message: 'Not authorized to comment' });
    }

    const comment = await Comment.create({
      project: projectId,
      user: req.user._id,
      text,
      imageUrl: imageUrl || null
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email role');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only comment owner can update
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this comment' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text, imageUrl: req.body.imageUrl },
      { new: true, runValidators: true }
    ).populate('user', 'name email role');

    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('project');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const project = await Project.findById(comment.project._id);

    // Comment owner, project owner, or team leader can delete
    const isCommentOwner = comment.user.toString() === req.user._id.toString();
    const isProjectOwner = project.owner.toString() === req.user._id.toString();
    const isTeamLeader = project.teamLeader && project.teamLeader.toString() === req.user._id.toString();

    if (!isCommentOwner && !isProjectOwner && !isTeamLeader) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};