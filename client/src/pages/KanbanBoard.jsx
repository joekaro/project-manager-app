import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { tasksAPI, commentsAPI } from '../services/api';

const KanbanBoard = ({ project, onBack }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'forum'
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState('');
  const [filters, setFilters] = useState({
    priority: 'all',
    search: '',
    assignedTo: 'all'
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo',
    assignedTo: ''
  });

  useEffect(() => {
    loadTasks();
    loadComments();
  }, [project]);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const loadTasks = async () => {
    setLoading(true);
    const data = await tasksAPI.getByProject(project._id);
    if (Array.isArray(data)) {
      setTasks(data);
    }
    setLoading(false);
  };

  const loadComments = async () => {
    const data = await commentsAPI.getByProject(project._id);
    if (Array.isArray(data)) {
      setComments(data);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.assignedTo !== 'all') {
      filtered = filtered.filter(task => 
        filters.assignedTo === 'unassigned' 
          ? !task.assignedTo 
          : task.assignedTo?._id === filters.assignedTo
      );
    }

    if (filters.search) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    setFilteredTasks(filtered);
  };

  const getStatistics = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'inprogress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, todo, overdue, completionRate };
  };

  const stats = getStatistics();

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        status: task.status,
        assignedTo: task.assignedTo?._id || ''
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        status: 'todo',
        assignedTo: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (editingTask) {
      const data = await tasksAPI.update(editingTask._id, taskForm);
      if (data._id) {
        setTasks(tasks.map(t => t._id === data._id ? data : t));
      }
    } else {
      const data = await tasksAPI.create(project._id, taskForm);
      if (data._id) {
        setTasks([...tasks, data]);
      }
    }
    setShowModal(false);
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo', assignedTo: '' });
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus) => {
    if (draggedTask && draggedTask.status !== newStatus) {
      const updatedTask = await tasksAPI.update(draggedTask._id, { status: newStatus });
      if (updatedTask._id) {
        setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
      }
    }
    setDraggedTask(null);
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      await tasksAPI.delete(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
    }
  };

  const handleEditTask = (task, e) => {
    e.stopPropagation();
    handleOpenModal(task);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const data = await commentsAPI.create({
      projectId: project._id,
      text: commentText,
      imageUrl: commentImage || null
    });

    if (data._id) {
      setComments([...comments, data]);
      setCommentText('');
      setCommentImage('');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await commentsAPI.delete(commentId);
      setComments(comments.filter(c => c._id !== commentId));
    }
  };

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-50' },
    { id: 'inprogress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'done', title: 'Done', color: 'bg-green-50' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
            >
              ← Back
            </button>
            {activeTab === 'board' && (
              <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 sm:px-6 rounded-lg transition text-sm sm:text-base"
              >
                + Add Task
              </button>
            )}
          </div>
          <div className="mt-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{project.description}</p>
            
            {/* Tabs */}
            <div className="flex gap-4 mt-4 border-b">
              <button
                onClick={() => setActiveTab('board')}
                className={`pb-2 px-1 text-sm sm:text-base font-medium transition ${
                  activeTab === 'board'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Kanban Board
              </button>
              <button
                onClick={() => setActiveTab('forum')}
                className={`pb-2 px-1 text-sm sm:text-base font-medium transition ${
                  activeTab === 'forum'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Team Forum ({comments.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Board View */}
      {activeTab === 'board' && (
        <>
          {/* Statistics */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-600 font-medium">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-green-600 font-medium">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-yellow-600 font-medium">In Progress</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">To Do</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.todo}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-red-600 font-medium">Overdue</p>
                <p className="text-xl sm:text-2xl font-bold text-red-900">{stats.overdue}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-purple-600 font-medium">Completion</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">{stats.completionRate}%</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
              />
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <select
                value={filters.assignedTo}
                onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
              >
                <option value="all">All Members</option>
                <option value="unassigned">Unassigned</option>
                {project.members.map(member => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kanban Columns */}
          <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading tasks...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {columns.map((column) => (
                  <div
                    key={column.id}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(column.id)}
                    className={`${column.color} rounded-lg p-4 min-h-[200px]`}
                  >
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                      {column.title}
                      <span className="text-xs sm:text-sm font-normal bg-white px-2 py-1 rounded">
                        {getTasksByStatus(column.id).length}
                      </span>
                    </h2>

                    <div className="space-y-3">
                      {getTasksByStatus(column.id).map((task) => (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          className="bg-white rounded-lg shadow p-4 cursor-move hover:shadow-md transition group relative"
                        >
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleEditTask(task, e)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => handleDeleteTask(task._id, e)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>

                          <div className="mb-2 pr-16">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base break-words">
                              {task.title}
                            </h3>
                          </div>

                          {task.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {task.assignedTo && (
                            <div className="mb-3 flex items-center gap-2">
                              <span className="text-xs text-gray-500">Assigned to:</span>
                              <span className="text-xs font-medium text-gray-900">{task.assignedTo.name}</span>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className={`text-xs ${
                                new Date(task.dueDate) < new Date() && task.status !== 'done'
                                  ? 'text-red-600 font-semibold'
                                  : 'text-gray-500'
                              }`}>
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* Forum View */}
      {activeTab === 'forum' && (
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            {/* Post Comment Form */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Post Update</h2>
              <form onSubmit={handlePostComment} className="space-y-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm sm:text-base"
                  rows="4"
                  placeholder="Share progress updates, ask questions, or discuss with the team..."
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={commentImage}
                    onChange={(e) => setCommentImage(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Paste a publicly accessible image URL to attach a photo
                  </p>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition text-sm sm:text-base"
                >
                  Post Update
                </button>
              </form>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-600">No updates yet. Be the first to post!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.user.name}</span>
                          <span className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(comment.user.role)}`}>
                            {comment.user.role.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {comment.user._id === user._id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap mb-3">
                      {comment.text}
                    </p>
                    {comment.imageUrl && (
                      <img
                        src={comment.imageUrl}
                        alt="Attached"
                        className="rounded-lg max-w-full h-auto max-h-96 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      )}

      {/* Task Modal (same as before) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm sm:text-base"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="">Unassigned</option>
                  {project.members.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-3 px-6 rounded-lg transition text-sm sm:text-base"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;