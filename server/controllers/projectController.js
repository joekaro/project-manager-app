import Project from '../models/Project.js';

// @desc    Get all projects for logged in user
// @route   GET /api/projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { teamLeader: req.user._id },
        { members: req.user._id }
      ]
    })
      .populate('owner', 'name email role')
      .populate('teamLeader', 'name email role')
      .populate('members', 'name email role');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role')
      .populate('teamLeader', 'name email role')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { name, description, teamLeader, members } = req.body;

    // Create members array including owner, team leader, and members
    let allMembers = [req.user._id];
    
    if (teamLeader) {
      allMembers.push(teamLeader);
    }
    
    if (members && Array.isArray(members)) {
      allMembers = [...allMembers, ...members];
    }

    // Remove duplicates
    allMembers = [...new Set(allMembers.map(id => id.toString()))];

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      teamLeader: teamLeader || null,
      members: allMembers
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('teamLeader', 'name email role')
      .populate('members', 'name email role');

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or team leader
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isTeamLeader = project.teamLeader && project.teamLeader.toString() === req.user._id.toString();

    if (!isOwner && !isTeamLeader) {
      return res.status(401).json({ message: 'Not authorized to update this project' });
    }

    // If updating members or team leader, ensure they're included
    if (req.body.members || req.body.teamLeader) {
      let allMembers = [project.owner.toString()];
      
      const newTeamLeader = req.body.teamLeader || project.teamLeader;
      if (newTeamLeader) {
        allMembers.push(newTeamLeader.toString());
      }
      
      const newMembers = req.body.members || project.members;
      if (newMembers && Array.isArray(newMembers)) {
        allMembers = [...allMembers, ...newMembers.map(id => id.toString())];
      }

      // Remove duplicates
      req.body.members = [...new Set(allMembers)];
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email role')
      .populate('teamLeader', 'name email role')
      .populate('members', 'name email role');

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only project owner can delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or team leader
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isTeamLeader = project.teamLeader && project.teamLeader.toString() === req.user._id.toString();

    if (!isOwner && !isTeamLeader) {
      return res.status(401).json({ message: 'Not authorized to add members' });
    }

    // Check if member already exists
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(userId);
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('teamLeader', 'name email role')
      .populate('members', 'name email role');

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
export const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or team leader
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isTeamLeader = project.teamLeader && project.teamLeader.toString() === req.user._id.toString();

    if (!isOwner && !isTeamLeader) {
      return res.status(401).json({ message: 'Not authorized to remove members' });
    }

    // Cannot remove owner or team leader
    if (req.params.userId === project.owner.toString() || 
        req.params.userId === project.teamLeader?.toString()) {
      return res.status(400).json({ message: 'Cannot remove owner or team leader' });
    }

    project.members = project.members.filter(
      member => member.toString() !== req.params.userId
    );
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('teamLeader', 'name email role')
      .populate('members', 'name email role');

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};