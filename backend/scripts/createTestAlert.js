import mongoose from 'mongoose';
import Alert from '../models/alert.model.js';
import Agency from '../models/agency.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-bolt';

async function createTestAlert() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a random agency to be the sender
    const agencies = await Agency.find();
    if (agencies.length === 0) {
      throw new Error('No agencies found in the database');
    }

    const senderAgency = agencies[0];
    const recipientAgencies = agencies.slice(1, 3);

    // Create test alert
    const alert = new Alert({
      title: 'Test Emergency Alert',
      message: 'This is a test emergency alert. Please ignore.',
      severity: 'medium',
      coordinates: [77.2090, 28.6139], // New Delhi coordinates
      radius: 10, // 10km radius
      createdBy: senderAgency._id,
      sender: senderAgency._id,
      status: 'active',
      recipients: [
        {
          agency: senderAgency._id,
          read: true,
          readAt: new Date()
        },
        ...recipientAgencies.map(agency => ({
          agency: agency._id,
          read: false
        }))
      ],
      readBy: [senderAgency._id],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
    });

    await alert.save();
    console.log('Test alert created successfully:', alert);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating test alert:', error);
    process.exit(1);
  }
}

createTestAlert(); 