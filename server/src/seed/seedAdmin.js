require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Client = require('../models/Client');

const seed = async () => {
  try {
    await connectDB();

    let admin = await User.findOne({ email: 'admin@codexlabz.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: 'admin@codexlabz.com',
        passwordHash: await bcrypt.hash('Admin@123', 10),
        role: 'ADMIN',
      });
      console.log('Created ADMIN user: admin@codexlabz.com');
    } else {
      console.log('ADMIN user already exists');
    }

    let client = await Client.findOne({ contactEmail: 'client@demo.com' });
    if (!client) {
      client = await Client.create({
        companyName: 'Demo Startup',
        contactName: 'Demo Client',
        contactEmail: 'client@demo.com',
        contactPhone: '555-0100',
      });
      console.log('Created sample Client: Demo Startup');
    } else {
      console.log('Sample Client already exists');
    }

    let clientUser = await User.findOne({ email: 'client@demo.com' });
    if (!clientUser) {
      clientUser = await User.create({
        name: 'Demo Client',
        email: 'client@demo.com',
        passwordHash: await bcrypt.hash('Client@123', 10),
        role: 'CLIENT',
        clientId: client._id,
      });
      console.log('Created CLIENT user: client@demo.com');
    } else {
      console.log('CLIENT user already exists');
    }

    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
