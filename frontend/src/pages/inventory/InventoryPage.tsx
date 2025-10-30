import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Search, Filter } from 'lucide-react';
import { inventoryAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { InventoryItem } from '../../types';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Food', label: 'Food' },
  { value: 'Shelter', label: 'Shelter' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Rescue', label: 'Rescue' },
  { value: 'Other', label: 'Other' }
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'available', label: 'Available' },
  { value: 'borrowed', label: 'Borrowed' },
  { value: 'in-use', label: 'In Use' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'depleted', label: 'Depleted' }
];

const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        if (user) {
          const agencyId = typeof user.agency === 'string' ? user.agency : user.agency._id;
          const response = await inventoryAPI.getAgencyInventory(agencyId);
          setInventory(response);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [user]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'borrowed':
        return 'warning';
      case 'in-use':
        return 'primary';
      case 'maintenance':
        return 'secondary';
      case 'depleted':
        return 'error';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage your agency's resources</p>
        </div>
        <Link to="/inventory/new">
          <Button variant="primary" icon={<Plus size={16} />}>
            Add Item
          </Button>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Input
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={16} />}
          className="md:col-span-2"
        />
        <Select
          options={categories}
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value)}
          placeholder="Filter by category"
          icon={<Filter size={16} />}
        />
        <Select
          options={statusOptions}
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(value)}
          placeholder="Filter by status"
          icon={<Filter size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredInventory.map((item) => (
          <Link
            key={item._id}
            to={`/inventory/${item._id}`}
            className="block hover:shadow-lg transition-shadow duration-200"
          >
            <Card>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-100 rounded-full">
                  <Package size={24} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900 truncate">
                      {item.name}
                    </h2>
                    <Badge
                      variant={getStatusColor(item.status)}
                      size="sm"
                      rounded
                    >
                      {item.status}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="truncate">
                      Quantity: {item.quantity} {item.unit}
                    </span>
                  </div>
                  {item.category && (
                    <div className="mt-2">
                      <Badge variant="secondary" size="sm">
                        {item.category}
                      </Badge>
                    </div>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="primary" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.currentHolder && (
                    <div className="mt-2 text-sm text-gray-500">
                      Currently with:{' '}
                      {typeof item.currentHolder.agency === 'string'
                        ? item.currentHolder.agency
                        : item.currentHolder.agency.name}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedCategory || selectedStatus
              ? 'Try adjusting your filters'
              : 'Get started by adding some items to your inventory'}
          </p>
          {!searchTerm && !selectedCategory && !selectedStatus && (
            <div className="mt-6">
              <Link to="/inventory/new">
                <Button variant="primary" icon={<Plus size={16} />}>
                  Add First Item
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;