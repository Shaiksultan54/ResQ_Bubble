import mongoose from 'mongoose';

const borrowSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  ownerAgency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  borrowerAgency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'returned', 'overdue'],
    default: 'pending'
  },
  borrowDate: {
    type: Date,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date
  },
  purpose: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  condition: {
    beforeBorrow: {
      description: String,
      images: [String]
    },
    afterReturn: {
      description: String,
      images: [String]
    }
  }
}, { timestamps: true });

const Borrow = mongoose.model('Borrow', borrowSchema);

export default Borrow;