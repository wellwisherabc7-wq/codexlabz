const Project = require('../models/Project');
const Task = require('../models/Task');
const Client = require('../models/Client');
const asyncHandler = require('../utils/asyncHandler');

const assertProjectAccess = (req, project) => {
  if (req.user.role === 'ADMIN') return true;
  if (!project || !project.clientId) return false;
  const clientId = project.clientId._id
    ? project.clientId._id.toString()
    : project.clientId.toString();
  return clientId === req.user.clientId;
};

const getProjects = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'CLIENT' ? { clientId: req.user.clientId } : {};
  const projects = await Project.find(filter)
    .populate('clientId', 'companyName contactName contactEmail')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: projects });
});

const createProject = asyncHandler(async (req, res) => {
  const { clientId, name, description, status, deadline } = req.body;
  if (!clientId || !name) {
    return res.status(400).json({ success: false, message: 'clientId and name are required' });
  }
  const client = await Client.findById(clientId);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }
  const project = await Project.create({
    clientId,
    name,
    description,
    status,
    deadline: deadline || undefined,
  });
  const populated = await project.populate('clientId', 'companyName contactName contactEmail');
  res.status(201).json({ success: true, data: populated });
});

const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(
    'clientId',
    'companyName contactName contactEmail'
  );
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  if (!assertProjectAccess(req, project)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  res.json({ success: true, data: project });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const { name, description, status, deadline, clientId } = req.body;
  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (status !== undefined) project.status = status;
  if (deadline !== undefined) project.deadline = deadline || null;
  if (clientId !== undefined) project.clientId = clientId;

  await project.save();
  const populated = await project.populate('clientId', 'companyName contactName contactEmail');
  res.json({ success: true, data: populated });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  await Task.deleteMany({ projectId: project._id });
  await project.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

const getProjectTasks = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  if (!assertProjectAccess(req, project)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const tasks = await Task.find({ projectId: project._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: tasks });
});

const createProjectTask = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  const { title, status, priority, dueDate } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  const task = await Task.create({
    projectId: project._id,
    title,
    status,
    priority,
    dueDate: dueDate || undefined,
  });
  res.status(201).json({ success: true, data: task });
});

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjectTasks,
  createProjectTask,
};
