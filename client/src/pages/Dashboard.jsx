import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { projectsAPI, invitationsAPI } from '../services/api';

const Dashboard = ({ onSelectProject }) => {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectForm, setProjectForm] = useState({ 
    name: '', 
    description: '', 
    status: 'active'
  });
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member'
  });

  useEffect(() => {
    loadProjects();
    loadInvitations();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await projectsAPI.getAll();
    if (Array.isArray(data)) {
      setProjects(data);
    }
    setLoading(false);
  };

  const loadInvitations = async () => {
    const data = await invitationsAPI.getMy();
    if (Array.isArray(data)) {
      setInvitations(data);
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setProjectForm({ 
        name: project.name, 
        description: project.description || '', 
        status: project.status
      });
    } else {
      setEditingProject(null);
      setProjectForm({ 
        name: '', 
        description: '', 
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (editingProject) {
      const data = await projectsAPI.update(editingProject._id, projectForm);
      if (data._id) {
        setProjects(projects.map(p => p._id === data._id ? data : p));
      }
    } else {
      const data = await projectsAPI.create(projectForm);
      if (data._id) {
        setProjects([data, ...projects]);
      }
    }
    setShowModal(false);
    setEditingProject(null);
    setProjectForm({ name: '', description: '', status: 'active' });
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? All tasks will be lost.')) {
      await projectsAPI.delete(projectId);
      setProjects(projects.filter(p => p._id !== projectId));
    }
  };

  const handleEditProject = (project, e) => {
    e.stopPropagation();
    handleOpenModal(project);
  };

  const handleOpenInviteModal = (project, e) => {
    e.stopPropagation();
    setSelectedProject(project);
    setInviteForm({ email: '', role: 'member' });
    setShowInviteModal(true);
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    const data = await invitationsAPI.send({
      projectId: selectedProject._id,
      email: inviteForm.email,
      role: inviteForm.role
    });

    if (data._id) {
      alert('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'member' });
    } else if (data.message) {
      alert(data.message);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    const data = await invitationsAPI.accept(invitationId);
    if (data.project) {
      setProjects([data.project, ...projects]);
      setInvitations(invitations.filter(i => i._id !== invitationId));
      alert('Invitation accepted! You can now access the project.');
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    await invitationsAPI.decline(invitationId);
    setInvitations(invitations.filter(i => i._id !== invitationId));
    alert('Invitation declined.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'project_manager': return 'bg-purple-100 text-purple-800';
      case 'team_leader': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'project_manager': return 'Project Manager';
      case 'team_leader': return 'Team Leader';
      case 'member': return 'Member';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Projects</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs sm:text-sm text-gray-600">Welcome back, {user?.name}</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-sm sm:text-base text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 py-4 bg-blue-50 border-b border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Pending Invitations ({invitations.length})</h2>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation._id} className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{invitation.project.name}</h3>
                  <p className="text-sm text-gray-600">
                    Invited by {invitation.invitedBy.name} as <span className="font-medium">{getRoleLabel(invitation.role)}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{invitation.project.description}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleAcceptInvitation(invitation._id)}
                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvitation(invitation._id)}
                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Create Project Button */}
        <div className="mb-6">
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 text-sm sm:text-base"
          >
            + New Project
          </button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No projects yet</p>
            <p className="text-sm text-gray-500">Create your first project to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => onSelectProject(project)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition duration-200 p-5 sm:p-6 cursor-pointer relative group"
              >
                {/* Action Buttons */}
                {(project.owner._id === user._id || project.teamLeader?._id === user._id) && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleOpenInviteModal(project, e)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded text-sm"
                      title="Invite Members"
                    >
                      👥
                    </button>
                    <button
                      onClick={(e) => handleEditProject(project, e)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    {project.owner._id === user._id && (
                      <button
                        onClick={(e) => handleDeleteProject(project._id, e)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded text-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-start justify-between mb-3 pr-24">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1 break-words">
                    {project.name}
                  </h3>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">
                  {project.description || 'No description'}
                </p>

                {/* Team Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="text-gray-500 w-20">Owner:</span>
                    <span className="font-medium text-gray-900">{project.owner.name}</span>
                  </div>
                  {project.teamLeader && (
                    <div className="flex items-center text-xs sm:text-sm">
                      <span className="text-gray-500 w-20">Leader:</span>
                      <span className="font-medium text-gray-900">{project.teamLeader.name}</span>
                    </div>
                  )}
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="text-gray-500 w-20">Team:</span>
                    <span className="font-medium text-gray-900">{project.members.length} member(s)</span>
                  </div>
                </div>

                <div className="flex items-center text-xs sm:text-sm text-gray-500 pt-3 border-t">
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm sm:text-base"
                  rows="3"
                  placeholder="Enter project description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={projectForm.status}
                  onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-3 px-6 rounded-lg transition text-sm sm:text-base"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Invite to {selectedProject.name}
            </h2>
            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                  placeholder="user@example.com"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The user must be registered with this email first
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="member">Team Member</option>
                  {selectedProject.owner._id === user._id && (
                    <option value="team_leader">Team Leader</option>
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {inviteForm.role === 'team_leader' 
                    ? 'Team leaders can invite members and manage tasks' 
                    : 'Members can view and contribute to the project'}
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="w-full sm:w-auto px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-3 px-6 rounded-lg transition text-sm sm:text-base"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;