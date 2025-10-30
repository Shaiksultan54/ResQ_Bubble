import Borrow from '../models/borrow.model.js';
import InventoryItem from '../models/inventory.model.js';

export const getAllBorrowRequests = async (req, res) => {
  try {
    const { status, agency } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (agency) {
      filter.$or = [
        { ownerAgency: agency },
        { borrowerAgency: agency }
      ];
    }
    
    const borrowRequests = await Borrow.find(filter)
      .populate('item', 'name category')
      .populate('ownerAgency', 'name')
      .populate('borrowerAgency', 'name')
      .populate('requestedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.status(200).json(borrowRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBorrowById = async (req, res) => {
  try {
    const borrowRequest = await Borrow.findById(req.params.id)
      .populate('item', 'name category quantity unit status')
      .populate('ownerAgency', 'name contactEmail contactPhone')
      .populate('borrowerAgency', 'name contactEmail contactPhone')
      .populate('requestedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');
    
    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }
    
    res.status(200).json(borrowRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBorrowRequest = async (req, res) => {
  try {
    const {
      itemId,
      quantity,
      ownerAgencyId,
      expectedReturnDate,
      purpose
    } = req.body;
    
    // Check if item exists and is available
    const item = await InventoryItem.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    if (item.status !== 'available') {
      return res.status(400).json({ message: 'Item is not available for borrowing' });
    }
    
    if (item.quantity < quantity) {
      return res.status(400).json({ message: 'Requested quantity exceeds available quantity' });
    }
    
    // Create new borrow request
    const newBorrowRequest = new Borrow({
      item: itemId,
      quantity,
      ownerAgency: ownerAgencyId,
      borrowerAgency: req.user.agency,
      requestedBy: req.user._id,
      expectedReturnDate,
      purpose
    });
    
    const savedRequest = await newBorrowRequest.save();
    
    const populatedRequest = await Borrow.findById(savedRequest._id)
      .populate('item', 'name category')
      .populate('ownerAgency', 'name')
      .populate('borrowerAgency', 'name')
      .populate('requestedBy', 'firstName lastName');
    
    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBorrowStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!['approved', 'rejected', 'returned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const borrowRequest = await Borrow.findById(req.params.id);
    
    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }
    
    // Check if user belongs to the owner agency
    if (req.user.agency.toString() !== borrowRequest.ownerAgency.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this borrow request' });
    }
    
    // Update the borrow request
    borrowRequest.status = status;
    borrowRequest.notes = notes || borrowRequest.notes;
    borrowRequest.approvedBy = req.user._id;
    
    if (status === 'approved') {
      // Update the inventory item status
      const item = await InventoryItem.findById(borrowRequest.item);
      
      if (item.quantity < borrowRequest.quantity) {
        return res.status(400).json({ message: 'Requested quantity exceeds available quantity' });
      }
      
      item.status = 'borrowed';
      item.currentHolder = {
        agency: borrowRequest.borrowerAgency,
        since: new Date()
      };
      
      await item.save();
    } else if (status === 'returned') {
      // Update inventory item status back to available
      const item = await InventoryItem.findById(borrowRequest.item);
      
      item.status = 'available';
      item.currentHolder = null;
      borrowRequest.actualReturnDate = new Date();
      
      await item.save();
    }
    
    const updatedRequest = await borrowRequest.save();
    
    const populatedRequest = await Borrow.findById(updatedRequest._id)
      .populate('item', 'name category status')
      .populate('ownerAgency', 'name')
      .populate('borrowerAgency', 'name')
      .populate('requestedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');
    
    res.status(200).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgencyBorrowHistory = async (req, res) => {
  try {
    const { agencyId } = req.params;
    
    const borrowHistory = await Borrow.find({
      $or: [
        { ownerAgency: agencyId },
        { borrowerAgency: agencyId }
      ]
    })
      .populate('item', 'name category')
      .populate('ownerAgency', 'name')
      .populate('borrowerAgency', 'name')
      .populate('requestedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.status(200).json(borrowHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getItemBorrowHistory = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const borrowHistory = await Borrow.find({ item: itemId })
      .populate('borrowerAgency', 'name')
      .populate('requestedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.status(200).json(borrowHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};