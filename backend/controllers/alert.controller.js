import Alert from '../models/alert.model.js';
import Agency from '../models/agency.model.js';

export const getAgencyAlerts = async (req, res) => {
  try {
    const { agencyId } = req.params;
    
    console.log('Fetching alerts for agency:', agencyId);
    
    // Find alerts where the agency is either the creator or a recipient
    const alerts = await Alert.find({
      $or: [
        { createdBy: agencyId },
        { 'recipients.agency': agencyId }
      ]
    })
    .populate({
      path: 'createdBy',
      select: 'name type'
    })
    .populate({
      path: 'sender',
      select: 'name type'
    })
    .populate({
      path: 'recipients.agency',
      select: 'name type'
    })
    .sort({ createdAt: -1 });
    
    console.log(`Found ${alerts.length} alerts for agency ${agencyId}`);
    console.log('Sample alert:', alerts[0]);
    
    // Transform alerts to include read status for this agency
    const transformedAlerts = alerts.map(alert => {
      const alertObj = alert.toObject();
      const recipientInfo = alertObj.recipients.find(
        r => r.agency._id.toString() === agencyId
      );
      
      return {
        ...alertObj,
        isRead: recipientInfo ? recipientInfo.read : false,
        readAt: recipientInfo ? recipientInfo.readAt : null
      };
    });
    
    res.status(200).json({
      success: true,
      data: transformedAlerts
    });
  } catch (error) {
    console.error('Error fetching agency alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
};

export const getSentAlerts = async (req, res) => {
  try {
    const { agencyId } = req.params;
    
    // Check if user belongs to the agency
    if (req.user.agency.toString() !== agencyId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view alerts for this agency' });
    }
    
    const alerts = await Alert.find({ createdBy: agencyId })
      .populate('recipients.agency', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching sent alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sent alerts',
      error: error.message
    });
  }
};

export const createAlert = async (req, res) => {
  try {
    console.log('Creating alert with data:', req.body);
    
    const {
      title,
      message,
      severity,
      coordinates,
      radius,
      expiresAt,
      recipients = []
    } = req.body;
    
    const agencyId = req.user.agency._id;
    console.log('Creating alert for agency:', agencyId);
    
    // Validate coordinates
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      console.log('Invalid coordinates:', coordinates);
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates format. Must be [longitude, latitude]'
      });
    }

    const [longitude, latitude] = coordinates;
    if (typeof longitude !== 'number' || typeof latitude !== 'number' ||
        longitude < -180 || longitude > 180 ||
        latitude < -90 || latitude > 90) {
      console.log('Invalid coordinate values:', { longitude, latitude });
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
      });
    }

    // Validate radius
    if (typeof radius !== 'number' || radius <= 0) {
      console.log('Invalid radius:', radius);
      return res.status(400).json({
        success: false,
        message: 'Invalid radius. Must be a positive number'
      });
    }

    // Create initial recipients array with creating agency
    const initialRecipients = [{
      agency: agencyId,
      read: true,
      readAt: new Date()
    }];

    // Add other specified recipients
    if (Array.isArray(recipients)) {
      recipients.forEach(recipientId => {
        if (recipientId !== agencyId.toString()) {
          initialRecipients.push({
            agency: recipientId,
            read: false
          });
        }
      });
    }

    // Create the alert
    const alertData = {
      title,
      message,
      severity,
      coordinates: [longitude, latitude],
      radius,
      expiresAt: new Date(expiresAt),
      createdBy: agencyId,
      sender: agencyId,
      status: 'active',
      recipients: initialRecipients,
      readBy: [agencyId]
    };

    console.log('Creating alert with data:', alertData);
    const alert = new Alert(alertData);
    
    await alert.save();
    console.log('Alert created successfully:', alert._id);
    
    try {
      // Find nearby agencies based on coordinates and radius
      const nearbyAgencies = await Agency.find({
        _id: { $ne: agencyId },
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      });
      
      console.log(`Found ${nearbyAgencies.length} nearby agencies`);
      
      if (nearbyAgencies.length > 0) {
        // Add nearby agencies to recipients if not already included
        const existingRecipientIds = new Set(alert.recipients.map(r => r.agency.toString()));
        const newRecipients = nearbyAgencies
          .filter(agency => !existingRecipientIds.has(agency._id.toString()))
          .map(agency => ({
            agency: agency._id,
            read: false
          }));
        
        if (newRecipients.length > 0) {
          alert.recipients.push(...newRecipients);
          await alert.save();
          console.log(`Added ${newRecipients.length} nearby agencies as recipients`);
        }
      }
    } catch (geoError) {
      console.error('Error finding nearby agencies:', geoError);
      // Don't fail the alert creation if geospatial query fails
    }
    
    // Populate the response data
    const populatedAlert = await Alert.findById(alert._id)
      .populate('createdBy', 'name type')
      .populate('sender', 'name type')
      .populate('recipients.agency', 'name type');
    
    res.status(201).json({
      success: true,
      data: populatedAlert,
      message: 'Alert created successfully'
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create alert',
      error: error.message
    });
  }
};

export const markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const agencyId = req.user.agency._id;
    
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    // Find the recipient entry for this agency
    const recipientIndex = alert.recipients.findIndex(
      r => r.agency.toString() === agencyId.toString()
    );
    
    if (recipientIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'Agency is not a recipient of this alert'
      });
    }
    
    // Update the read status
    alert.recipients[recipientIndex].read = true;
    alert.recipients[recipientIndex].readAt = new Date();
    
    // Add to readBy if not already present
    if (!alert.readBy.includes(agencyId)) {
      alert.readBy.push(agencyId);
    }
    
    await alert.save();
    
    res.status(200).json({
      success: true,
      message: 'Alert marked as read'
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read',
      error: error.message
    });
  }
};

export const deactivateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const agencyId = req.user.agency._id;
    
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    // Check if the agency created the alert
    if (alert.createdBy.toString() !== agencyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to deactivate this alert'
      });
    }
    
    alert.status = 'inactive';
    await alert.save();
    
    res.status(200).json({
      success: true,
      message: 'Alert deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate alert',
      error: error.message
    });
  }
};

export const getUnreadAlertCount = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const count = await Alert.countDocuments({
      'recipients.agency': agencyId,
      status: 'active',
      readBy: { $ne: agencyId }
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread alert count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread alert count',
      error: error.message
    });
  }
};