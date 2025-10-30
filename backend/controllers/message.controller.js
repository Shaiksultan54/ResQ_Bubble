import Message from '../models/message.model.js';

export const getAgencyMessages = async (req, res) => {
  try {
    const { agencyId } = req.params;
    
    // Check if user belongs to the agency
    if (req.user.agency.toString() !== agencyId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view messages for this agency' });
    }
    
    const messages = await Message.find({
      $or: [
        { senderAgency: agencyId },
        { recipient: agencyId }
      ]
    })
      .populate('sender', 'firstName lastName')
      .populate('senderAgency', 'name')
      .populate('recipient', 'name')
      .populate('referencedItems', 'name category')
      .populate('referencedBorrows', 'status')
      .sort({ createdAt: -1 });
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { agency1Id, agency2Id } = req.params;
    
    // Check if user belongs to one of the agencies
    if (req.user.agency.toString() !== agency1Id && 
        req.user.agency.toString() !== agency2Id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }
    
    const messages = await Message.find({
      $or: [
        { senderAgency: agency1Id, recipient: agency2Id },
        { senderAgency: agency2Id, recipient: agency1Id }
      ]
    })
      .populate('sender', 'firstName lastName')
      .populate('senderAgency', 'name')
      .populate('recipient', 'name')
      .populate('referencedItems', 'name category')
      .populate('referencedBorrows', 'status')
      .sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const {
      recipientAgencyId,
      content,
      referencedItems,
      referencedBorrows,
      attachment
    } = req.body;
    
    const newMessage = new Message({
      sender: req.user._id,
      senderAgency: req.user.agency,
      recipient: recipientAgencyId,
      content,
      referencedItems,
      referencedBorrows,
      attachment
    });
    
    const savedMessage = await newMessage.save();
    
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'firstName lastName')
      .populate('senderAgency', 'name')
      .populate('recipient', 'name')
      .populate('referencedItems', 'name category')
      .populate('referencedBorrows', 'status');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user belongs to the recipient agency
    if (req.user.agency.toString() !== message.recipient.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }
    
    message.read = true;
    await message.save();
    
    res.status(200).json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadMessageCount = async (req, res) => {
  try {
    const { agencyId } = req.params;
    
    // Check if user belongs to the agency
    if (req.user.agency.toString() !== agencyId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view messages for this agency' });
    }
    
    const count = await Message.countDocuments({
      recipient: agencyId,
      read: false
    });
    
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};