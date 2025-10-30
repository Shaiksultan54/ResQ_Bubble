import InventoryItem from '../models/inventory.model.js';
import mongoose from 'mongoose';

const getAgencyInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find({ agency: req.params.agencyId });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInventoryItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id)
      .populate('agency', 'name type')
      .populate('currentHolder.agency', 'name type');
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInventoryItem = async (req, res) => {
  try {
    console.log('Creating inventory item:', {
      body: req.body,
      user: {
        id: req.user._id,
        role: req.user.role,
        agency: req.user.agency
      }
    });

    const {
      name,
      category,
      subcategory,
      description,
      quantity,
      unit,
      status,
      image,
      location,
      expiryDate,
      tags
    } = req.body;
    
    // Get agency ID from the authenticated user
    const agencyId = req.user.agency._id;
    
    if (!agencyId) {
      console.error('No agency ID found for user:', {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role
      });
      return res.status(400).json({ message: 'Agency ID not found. Please make sure you are associated with an agency.' });
    }
    
    // Check if item with same name already exists in the agency
    const existingItem = await InventoryItem.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      agency: agencyId 
    });
    
    if (existingItem) {
      return res.status(400).json({ 
        message: 'An item with this name already exists in your agency. Please use a different name or update the existing item.'
      });
    }
    
    const newItem = new InventoryItem({
      name,
      category,
      subcategory,
      description,
      quantity,
      unit,
      status: status || 'available',
      agency: agencyId,
      image,
      location,
      expiryDate,
      tags
    });
    
    const savedItem = await newItem.save();
    console.log('Inventory item created successfully:', {
      itemId: savedItem._id,
      name: savedItem.name,
      agency: savedItem.agency
    });
    
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    if (error.code === 11000) {
      res.status(400).json({ 
        message: 'An item with this name already exists in your agency. Please use a different name or update the existing item.'
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    // Check if user belongs to the agency that owns the item
    if (req.user.agency.toString() !== item.agency.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }
    
    const {
      name,
      category,
      subcategory,
      description,
      quantity,
      unit,
      status,
      image,
      location,
      expiryDate,
      tags
    } = req.body;
    
    const updateData = {
      name,
      category,
      subcategory,
      description,
      quantity,
      unit,
      status,
      image,
      location,
      expiryDate,
      tags
    };
    
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    // Check if user belongs to the agency that owns the item
    if (req.user.agency.toString() !== item.agency.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    
    // Check if item is currently borrowed
    if (item.status === 'borrowed') {
      return res.status(400).json({ message: 'Cannot delete item that is currently borrowed' });
    }
    
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchInventory = async (req, res) => {
  try {
    const { query, category, status } = req.query;
    
    const searchFilter = {};
    
    if (query) {
      searchFilter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }
    
    if (category) {
      searchFilter.category = category;
    }
    
    if (status) {
      searchFilter.status = status;
    }
    
    const items = await InventoryItem.find(searchFilter)
      .populate('agency', 'name type')
      .sort({ name: 1 });
    
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const items = await InventoryItem.find({
      category,
      status: 'available',
      quantity: { $gt: 0 }
    }).populate('agency', 'name type location');
    
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOtherAgenciesInventory = async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected:', {
        readyState: mongoose.connection.readyState,
        states: {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        }
      });
      return res.status(500).json({ 
        message: 'Database connection error. Please try again later.' 
      });
    }

    console.log('Fetching other agencies inventory:', {
      userId: req.user._id,
      userAgency: req.user.agency,
      userRole: req.user.role,
      dbState: mongoose.connection.readyState
    });

    if (!req.user.agency || !req.user.agency._id) {
      console.error('User has no agency:', {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role
      });
      return res.status(400).json({ 
        message: 'User is not associated with any agency. Please contact your administrator.' 
      });
    }

    const currentAgencyId = req.user.agency._id;

    // Find all inventory items from other agencies that are available
    const items = await InventoryItem.find({
      agency: { $ne: currentAgencyId },
      status: 'available',
      quantity: { $gt: 0 }
    })
    .populate({
      path: 'agency',
      select: '_id name type',
      model: 'Agency'
    })
    .sort({ createdAt: -1 })
    .lean(); // Use lean() for better performance

    console.log(`Found ${items.length} items from other agencies`);

    // Transform the response to ensure agency data is properly structured
    const transformedItems = items.map(item => ({
      ...item,
      agency: item.agency ? {
        _id: item.agency._id,
        name: item.agency.name,
        type: item.agency.type
      } : null
    }));

    res.json({ items: transformedItems });
  } catch (error) {
    console.error('Error fetching other agencies inventory:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      userAgency: req.user?.agency,
      userRole: req.user?.role,
      dbState: mongoose.connection.readyState
    });

    // Handle specific MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ 
        message: 'Database error occurred. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({ 
      message: 'Error fetching inventory items. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export {
  getAgencyInventory,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  searchInventory,
  getAvailableItemsByCategory,
  getOtherAgenciesInventory
};