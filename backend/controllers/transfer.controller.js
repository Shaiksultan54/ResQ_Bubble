import Transfer from '../models/transfer.model.js';
import InventoryItem from '../models/inventory.model.js';
import Agency from '../models/agency.model.js';
import User from '../models/user.model.js';

export const createTransfer = async (req, res) => {
  try {
    const {
      itemId,
      quantity,
      toAgencyId,
      assignedStaffId,
      estimatedDeliveryTime,
      priority,
      specialInstructions
    } = req.body;

    // Validate item exists and has sufficient quantity
    const item = await InventoryItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    // Get agencies for route planning
    const [fromAgency, toAgency] = await Promise.all([
      Agency.findById(req.user.agency),
      Agency.findById(toAgencyId)
    ]);

    if (!fromAgency || !toAgency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    // Validate assigned staff
    const assignedStaff = await User.findById(assignedStaffId);
    if (!assignedStaff || assignedStaff.agency.toString() !== req.user.agency.toString()) {
      return res.status(400).json({ message: 'Invalid staff assignment' });
    }

    const newTransfer = new Transfer({
      item: itemId,
      quantity,
      fromAgency: req.user.agency,
      toAgency: toAgencyId,
      assignedStaff: assignedStaffId,
      dispatchedBy: req.user._id,
      estimatedDeliveryTime,
      priority,
      specialInstructions,
      route: {
        startLocation: {
          coordinates: fromAgency.location.coordinates
        },
        endLocation: {
          coordinates: toAgency.location.coordinates
        }
      }
    });

    const savedTransfer = await newTransfer.save();

    // Update inventory status
    item.status = 'in-transit';
    await item.save();

    const populatedTransfer = await Transfer.findById(savedTransfer._id)
      .populate('item', 'name category')
      .populate('fromAgency', 'name location')
      .populate('toAgency', 'name location')
      .populate('assignedStaff', 'firstName lastName email')
      .populate('dispatchedBy', 'firstName lastName');

    // Emit real-time notification
    const io = req.app.get('io');
    io.to(toAgencyId).emit('new-transfer', populatedTransfer);
    io.to(assignedStaffId).emit('transfer-assigned', populatedTransfer);

    res.status(201).json(populatedTransfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTransferLocation = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { latitude, longitude, speed, heading } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Verify user is assigned staff
    if (transfer.assignedStaff.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this transfer' });
    }

    // Update current location
    transfer.route.currentLocation = {
      coordinates: [longitude, latitude],
      timestamp: new Date(),
      speed,
      heading
    };

    // Add waypoint
    transfer.route.waypoints.push({
      location: {
        coordinates: [longitude, latitude]
      },
      timestamp: new Date(),
      event: 'checkpoint'
    });

    // Update status if not already in transit
    if (transfer.status === 'dispatched') {
      transfer.status = 'in-transit';
    }

    await transfer.save();

    // Emit real-time location update
    const io = req.app.get('io');
    io.to(transfer.fromAgency.toString()).emit('location-update', {
      transferId: transfer._id,
      location: transfer.route.currentLocation,
      status: transfer.status
    });
    io.to(transfer.toAgency.toString()).emit('location-update', {
      transferId: transfer._id,
      location: transfer.route.currentLocation,
      status: transfer.status
    });

    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveTransfers = async (req, res) => {
  try {
    const { agencyId } = req.params;

    // Check authorization
    if (req.user.agency.toString() !== agencyId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const transfers = await Transfer.find({
      $or: [
        { fromAgency: agencyId },
        { toAgency: agencyId }
      ],
      status: { $in: ['dispatched', 'in-transit'] }
    })
      .populate('item', 'name category')
      .populate('fromAgency', 'name location')
      .populate('toAgency', 'name location')
      .populate('assignedStaff', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransferById = async (req, res) => {
  try {
    const { transferId } = req.params;

    const transfer = await Transfer.findById(transferId)
      .populate('item', 'name category description')
      .populate('fromAgency', 'name location contactPhone')
      .populate('toAgency', 'name location contactPhone')
      .populate('assignedStaff', 'firstName lastName email phone')
      .populate('dispatchedBy', 'firstName lastName')
      .populate('deliveryConfirmation.receivedBy', 'firstName lastName');

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Check authorization
    const userAgency = req.user.agency.toString();
    const isAuthorized = transfer.fromAgency._id.toString() === userAgency ||
                        transfer.toAgency._id.toString() === userAgency ||
                        transfer.assignedStaff._id.toString() === req.user._id.toString() ||
                        req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this transfer' });
    }

    res.status(200).json(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTransferStatus = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { status, notes, securityCode } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Verify authorization based on status change
    if (status === 'dispatched' && transfer.dispatchedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only dispatcher can mark as dispatched' });
    }

    if (status === 'delivered') {
      // Verify security code for delivery
      if (securityCode !== transfer.securityCode) {
        return res.status(400).json({ message: 'Invalid security code' });
      }

      // Must be received by someone from destination agency
      if (req.user.agency.toString() !== transfer.toAgency.toString()) {
        return res.status(403).json({ message: 'Only destination agency can confirm delivery' });
      }

      transfer.deliveryConfirmation = {
        receivedBy: req.user._id,
        timestamp: new Date(),
        notes
      };

      transfer.actualDeliveryTime = new Date();

      // Update inventory
      const item = await InventoryItem.findById(transfer.item);
      if (item) {
        item.status = 'available';
        item.agency = transfer.toAgency;
        await item.save();
      }
    }

    transfer.status = status;

    // Add notification
    transfer.notifications.push({
      type: status === 'delivered' ? 'delivery' : 'status_update',
      message: `Transfer ${status}${notes ? ': ' + notes : ''}`,
      recipients: [
        { user: transfer.dispatchedBy },
        { user: transfer.assignedStaff }
      ]
    });

    await transfer.save();

    // Emit real-time status update
    const io = req.app.get('io');
    io.to(transfer.fromAgency.toString()).emit('transfer-status-update', {
      transferId: transfer._id,
      status: transfer.status,
      timestamp: new Date()
    });
    io.to(transfer.toAgency.toString()).emit('transfer-status-update', {
      transferId: transfer._id,
      status: transfer.status,
      timestamp: new Date()
    });

    res.status(200).json({ message: 'Transfer status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTransferPhoto = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { photoUrl, type, latitude, longitude, notes } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Verify user is assigned staff
    if (transfer.assignedStaff.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const photo = {
      url: photoUrl,
      type,
      timestamp: new Date(),
      notes
    };

    if (latitude && longitude) {
      photo.location = {
        coordinates: [longitude, latitude]
      };
    }

    transfer.photos.push(photo);
    await transfer.save();

    // Emit real-time photo update
    const io = req.app.get('io');
    io.to(transfer.fromAgency.toString()).emit('transfer-photo-added', {
      transferId: transfer._id,
      photo
    });
    io.to(transfer.toAgency.toString()).emit('transfer-photo-added', {
      transferId: transfer._id,
      photo
    });

    res.status(200).json({ message: 'Photo added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransferHistory = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const { status, startDate, endDate } = req.query;

    // Check authorization
    if (req.user.agency.toString() !== agencyId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const filter = {
      $or: [
        { fromAgency: agencyId },
        { toAgency: agencyId }
      ]
    };

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transfers = await Transfer.find(filter)
      .populate('item', 'name category')
      .populate('fromAgency', 'name')
      .populate('toAgency', 'name')
      .populate('assignedStaff', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const emergencyAlert = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { message, latitude, longitude } = req.body;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Verify user is assigned staff
    if (transfer.assignedStaff.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add emergency waypoint
    transfer.route.waypoints.push({
      location: {
        coordinates: [longitude, latitude]
      },
      timestamp: new Date(),
      event: 'emergency',
      notes: message
    });

    // Add emergency notification
    transfer.notifications.push({
      type: 'emergency',
      message: `EMERGENCY: ${message}`,
      recipients: [
        { user: transfer.dispatchedBy },
        // Add all managers from both agencies
      ]
    });

    await transfer.save();

    // Emit emergency alert
    const io = req.app.get('io');
    const emergencyData = {
      transferId: transfer._id,
      message,
      location: { latitude, longitude },
      timestamp: new Date(),
      staff: req.user.firstName + ' ' + req.user.lastName
    };

    io.to(transfer.fromAgency.toString()).emit('transfer-emergency', emergencyData);
    io.to(transfer.toAgency.toString()).emit('transfer-emergency', emergencyData);

    res.status(200).json({ message: 'Emergency alert sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};