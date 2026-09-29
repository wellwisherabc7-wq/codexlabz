const bcrypt = require('bcryptjs');
const Client = require('../models/Client');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

const getClients = asyncHandler(async (req, res) => {
  const clients = await Client.find().sort({ createdAt: -1 });
  res.json({ success: true, data: clients });
});

const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }
  res.json({ success: true, data: client });
});

const createClient = asyncHandler(async (req, res) => {
  const { companyName, contactName, contactEmail, contactPhone, portalPassword } = req.body;

  if (!companyName) {
    return res.status(400).json({ success: false, message: 'Company name is required' });
  }
  if (!contactEmail) {
    return res.status(400).json({ success: false, message: 'Contact email is required' });
  }
  if (!portalPassword) {
    return res.status(400).json({ success: false, message: 'Portal password is required' });
  }

  const email = contactEmail.toLowerCase().trim();
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  const client = await Client.create({
    companyName,
    contactName,
    contactEmail: email,
    contactPhone,
  });

  try {
    const passwordHash = await bcrypt.hash(portalPassword, 10);
    await User.create({
      name: contactName || companyName,
      email,
      passwordHash,
      role: 'CLIENT',
      clientId: client._id,
    });
  } catch (err) {
    await Client.findByIdAndDelete(client._id);
    throw err;
  }

  res.status(201).json({ success: true, data: client });
});

const updateClient = asyncHandler(async (req, res) => {
  const { companyName, contactName, contactEmail, contactPhone } = req.body;
  const client = await Client.findById(req.params.id);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  if (contactEmail) {
    const email = contactEmail.toLowerCase().trim();
    const existingUser = await User.findOne({
      email,
      clientId: { $ne: client._id },
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    client.contactEmail = email;
    await User.findOneAndUpdate({ clientId: client._id, role: 'CLIENT' }, { email });
  }

  if (companyName !== undefined) client.companyName = companyName;
  if (contactName !== undefined) {
    client.contactName = contactName;
    await User.findOneAndUpdate(
      { clientId: client._id, role: 'CLIENT' },
      { name: contactName || client.companyName }
    );
  }
  if (contactPhone !== undefined) client.contactPhone = contactPhone;

  await client.save();
  res.json({ success: true, data: client });
});

const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  const projects = await Project.find({ clientId: client._id }).select('_id');
  const projectIds = projects.map((p) => p._id);
  await Task.deleteMany({ projectId: { $in: projectIds } });
  await Project.deleteMany({ clientId: client._id });
  await User.deleteMany({ clientId: client._id, role: 'CLIENT' });
  await client.deleteOne();

  res.json({ success: true, data: { id: req.params.id } });
});

const getClientProjects = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }
  const projects = await Project.find({ clientId: client._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: projects });
});

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientProjects,
};
