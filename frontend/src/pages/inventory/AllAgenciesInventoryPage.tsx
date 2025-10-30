import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { inventoryAPI, borrowAPI } from '../../lib/api';
import { InventoryItem } from '../../types';
import { Package, Search, Filter, AlertTriangle, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';

const AllAgenciesInventoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [borrowLoading, setBorrowLoading] = useState<string | null>(null);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [returnDate, setReturnDate] = useState<string>('');

  useEffect(() => {
    fetchInventory();
    // Set default return date to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setReturnDate(defaultDate.toISOString().split('T')[0]);
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to fetch inventory...');
      
      const response = await inventoryAPI.getOtherAgenciesInventory();
      console.log('Inventory data received:', response);
      
      if (response && response.items) {
        setInventoryItems(response.items);
      } else {
        console.error('Invalid response format:', response);
        setError('Received invalid data format from server');
      }
    } catch (err: any) {
      console.error('Error in fetchInventory:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'You are not associated with any agency. Please contact your administrator.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this inventory.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch inventory items. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories and agencies for filters
  const categories = ['all', ...new Set(inventoryItems.map(item => item.category))];
  const agencies = ['all', ...new Set(inventoryItems.map(item => 
    typeof item.agency === 'string' ? item.agency : item.agency.name
  ))];

  // Filter items based on search query and filters
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesAgency = selectedAgency === 'all' || 
      (typeof item.agency === 'string' ? item.agency : item.agency.name) === selectedAgency;
    return matchesSearch && matchesCategory && matchesAgency;
  });

  const handleBorrowClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setShowQuantityDialog(true);
  };

  const handleBorrowRequest = async () => {
    if (!user || !user.agency || !selectedItem) {
      setError('You must be logged in and associated with an agency to borrow items');
      return;
    }

    if (!returnDate) {
      setError('Please select a return date');
      return;
    }

    try {
      setBorrowLoading(selectedItem._id);
      const agencyId = typeof user.agency === 'string' ? user.agency : user.agency._id;
      const lenderId = typeof selectedItem.agency === 'string' ? selectedItem.agency : selectedItem.agency._id;
      
      await borrowAPI.createBorrowRequest({
        itemId: selectedItem._id,
        quantity: quantity,
        ownerAgencyId: lenderId,
        expectedReturnDate: new Date(returnDate),
        purpose: 'Temporary use'
      });

      setShowQuantityDialog(false);
      navigate('/borrow');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create borrow request. Please try again.');
    } finally {
      setBorrowLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Agencies Inventory</h1>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agency Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  {agencies.map((agency) => (
                    <option key={agency} value={agency}>
                      {agency.charAt(0).toUpperCase() + agency.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600 mb-4">
            Showing {filteredItems.length} items
          </p>

          {/* Quantity Dialog */}
          {showQuantityDialog && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Borrow Request Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity (Available: {selectedItem.quantity})
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={selectedItem.quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), selectedItem.quantity))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Return Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="returnDate"
                        value={returnDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setShowQuantityDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleBorrowRequest}
                    isLoading={borrowLoading === selectedItem._id}
                    disabled={borrowLoading !== null || !returnDate}
                  >
                    Confirm Borrow
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {typeof item.agency === 'string' ? item.agency : item.agency.name}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {item.quantity} available
                      </span>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Category:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {item.category}
                        </span>
                      </div>
                      
                      {item.subcategory && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">Subcategory:</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {item.subcategory}
                          </span>
                        </div>
                      )}
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Update Borrow Button */}
                    <div className="mt-6">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleBorrowClick(item)}
                        isLoading={borrowLoading === item._id}
                        disabled={borrowLoading !== null}
                      >
                        Request to Borrow
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllAgenciesInventoryPage; 