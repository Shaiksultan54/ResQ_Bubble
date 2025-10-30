import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Medical', 'Food', 'Shelter', 'Transportation', 'Communication', 'Rescue', 'Other'],
    required: true
  },
  subcategory: {
    type: String
  },
  description: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'borrowed', 'in-use', 'maintenance', 'depleted'],
    default: 'available'
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  image: {
    type: String
  },
  location: {
    type: String
  },
  expiryDate: {
    type: Date
  },
  tags: [{
    type: String
  }],
  currentHolder: {
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency'
    },
    since: {
      type: Date
    }
  }
}, { timestamps: true });

// Virtual for remaining quantity
inventoryItemSchema.virtual('availableQuantity').get(function() {
  if (this.status === 'available') {
    return this.quantity;
  }
  return 0;
});

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;