import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Users, 
  Clock, 
  AlertTriangle, 
  MapPin,
  Truck,
  Shield
} from 'lucide-react';
import { transferAPI, inventoryAPI, agencyAPI, userAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { InventoryItem, Agency, User } from '../../types';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const priorityOptions = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'critical', label: 'Critical Priority' }
];

const CreateTransferPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: 1,
    toAgencyId: '',
    assignedStaffId: '',
    estimatedDeliveryTime: '',
    priority: 'medium',
    specialInstructions: ''
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const [inventoryData, agenciesData, staffData] = await Promise.all([
            inventoryAPI.getAgencyInventory(user.agency),
            agencyAPI.getAllAgencies(),
            userAPI.getAgencyUsers(user.agency)
          ]);
          
          // Filter available inventory
          setInventory(inventoryData.filter(item => 
            item.status === 'available' && item.quantity > 0
          ));
          
          // Filter other agencies
          setAgencies(agenciesData.filter(agency => 
            agency._id !== user.agency && agency.active
          ));
          
          // Filter active staff
          setStaff(staffData.filter(s => s.active));
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleItemChange = (itemId: string) => {
    const item = inventory.find(i => i._id === itemId);
    setSelectedItem(item || null);
    setFormData(prev => ({
      ...prev,
      itemId,
      quantity: 1
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.itemId || !formData.toAgencyId || !formData.assignedStaffId) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (selectedItem && formData.quantity > selectedItem.quantity) {
      setError('Quantity exceeds available amount');
      return;
    }
    
    try {
      setSubmitting(true);
      
      await transferAPI.createTransfer({
        itemId: formData.itemId,
        quantity: formData.quantity,
        toAgencyId: formData.toAgencyId,
        assignedStaffId: formData.assignedStaffId,
        estimatedDeliveryTime: formData.estimatedDeliveryTime,
        priority: formData.priority,
        specialInstructions: formData.specialInstructions
      });
      
      navigate('/tracking');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const inventoryOptions = inventory.map(item => ({
    value: item._id,
    label: `${item.name} (${item.quantity} ${item.unit} available)`
  }));

  const agencyOptions = agencies.map(agency => ({
    value: agency._id,
    label: agency.name
  }));

  const staffOptions = staff.map(s => ({
    value: s.id,
    label: `${s.firstName} ${s.lastName} (${s.role})`
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Transfer</h1>
        <p className="text-gray-600">Dispatch inventory to another agency with live tracking</p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          icon={<AlertTriangle size={16} />}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Transfer Details">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Select
                label="Select Item"
                options={inventoryOptions}
                value={formData.itemId}
                onChange={(value) => handleItemChange(value)}
                icon={<Package size={16} />}
                required
              />

              {selectedItem && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Item Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span> {selectedItem.category}
                    </div>
                    <div>
                      <span className="text-gray-500">Available:</span> {selectedItem.quantity} {selectedItem.unit}
                    </div>
                    {selectedItem.description && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Description:</span> {selectedItem.description}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Input
                label="Quantity"
                type="number"
                min="1"
                max={selectedItem?.quantity || 1}
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  quantity: parseInt(e.target.value)
                }))}
                icon={<Package size={16} />}
                required
              />

              <Select
                label="Destination Agency"
                options={agencyOptions}
                value={formData.toAgencyId}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  toAgencyId: value
                }))}
                icon={<MapPin size={16} />}
                required
              />

              <Select
                label="Assigned Staff"
                options={staffOptions}
                value={formData.assignedStaffId}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  assignedStaffId: value
                }))}
                icon={<Users size={16} />}
                required
              />

              <Input
                label="Estimated Delivery Time"
                type="datetime-local"
                value={formData.estimatedDeliveryTime}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  estimatedDeliveryTime: e.target.value
                }))}
                icon={<Clock size={16} />}
                required
              />

              <Select
                label="Priority"
                options={priorityOptions}
                value={formData.priority}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  priority: value
                }))}
                icon={<AlertTriangle size={16} />}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  rows={3}
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specialInstructions: e.target.value
                  }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Any special handling instructions..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/tracking')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                  icon={<Truck size={16} />}
                >
                  Create Transfer
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card title="Transfer Information">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-full">
                  <Shield size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Security</h3>
                  <p className="text-sm text-gray-500">
                    A unique security code will be generated for this transfer
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-full">
                  <MapPin size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">GPS Tracking</h3>
                  <p className="text-sm text-gray-500">
                    Real-time location updates will be available
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-full">
                  <AlertTriangle size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Emergency Alerts</h3>
                  <p className="text-sm text-gray-500">
                    Staff can send emergency alerts during transport
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Important Notes
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Staff will receive mobile notifications</li>
                  <li>• Route will be logged for accountability</li>
                  <li>• Delivery requires security code verification</li>
                  <li>• Photos can be taken during transport</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateTransferPage;