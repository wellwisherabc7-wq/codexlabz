const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  const { title, status, priority, dueDate } = req.body;
  if (title !== undefined) task.title = title;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  await task.save();
  res.json({ success: true, data: task });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  await task.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { updateTask, deleteTask };
