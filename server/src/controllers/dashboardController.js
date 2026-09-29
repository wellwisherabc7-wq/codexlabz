const Client = require('../models/Client');
const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalClients, totalActiveProjects, taskGroups, activeProjects] = await Promise.all([
    Client.countDocuments(),
    Project.countDocuments({ status: 'ACTIVE' }),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Project.find({ status: 'ACTIVE' }).populate('clientId', 'companyName'),
  ]);

  const dueSoon = [...activeProjects]
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    })
    .slice(0, 5);

  const taskCounts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  taskGroups.forEach((g) => {
    if (g._id) taskCounts[g._id] = g.count;
  });

  const recentProjects = await Project.find()
    .populate('clientId', 'companyName')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      totalClients,
      totalActiveProjects,
      taskCounts,
      dueSoonProjects: dueSoon,
      recentProjects,
    },
  });
});

const getClientDashboard = asyncHandler(async (req, res) => {
  const { clientId } = req.params;

  if (req.user.role === 'CLIENT' && req.user.clientId !== clientId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const client = await Client.findById(clientId);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  const projects = await Project.find({ clientId }).sort({ createdAt: -1 });
  const projectIds = projects.map((p) => p._id);
  const tasks = await Task.find({ projectId: { $in: projectIds } });

  const byProject = {};
  tasks.forEach((t) => {
    const key = t.projectId.toString();
    if (!byProject[key]) byProject[key] = { total: 0, done: 0 };
    byProject[key].total += 1;
    if (t.status === 'DONE') byProject[key].done += 1;
  });

  const data = projects.map((p) => {
    const stats = byProject[p._id.toString()] || { total: 0, done: 0 };
    const progress = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);
    return {
      ...p.toObject(),
      progress,
      taskTotal: stats.total,
      taskDone: stats.done,
    };
  });

  res.json({
    success: true,
    data: {
      client,
      projects: data,
    },
  });
});

module.exports = { getAdminDashboard, getClientDashboard };
