import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';
import { inventoryAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const categories = [
  { value: 'Medical', label: 'Medical' },
  { value: 'Food', label: 'Food' },
  { value: 'Shelter', label: 'Shelter' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Rescue', label: 'Rescue' },
  { value: 'Other', label: 'Other' }
];

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'in-use', label: 'In Use' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'depleted', label: 'Depleted' }
];

const NewInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    quantity: '',
    unit: '',
    status: 'available',
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!user.agency?._id) {
        throw new Error('Agency ID not found. Please make sure you are associated with an agency.');
      }

      const itemData = {
        ...formData,
        agency: user.agency._id,
        quantity: Number(formData.quantity),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      await inventoryAPI.createInventoryItem(itemData);
      navigate('/inventory');
    } catch (err: any) {
      console.error('Error creating item:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to create inventory items. Please contact your administrator.');
      } else {
        setError(err.message || err.response?.data?.message || 'Failed to create inventory item');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/inventory')}
        >
          Back to Inventory
        </Button>
      </div>

      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-2 bg-primary-100 rounded-full">
            <Package size={24} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Item</h1>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="Item Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              options={categories}
              required
            />
          </div>

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Input
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
            <Input
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="e.g., pieces, kg, liters"
              required
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              options={statusOptions}
              required
            />
          </div>

          <Input
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Enter tags separated by commas"
          />

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/inventory')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
            >
              Create Item
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewInventoryPage; 