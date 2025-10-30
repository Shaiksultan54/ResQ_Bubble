import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { inventoryAPI, messageAPI } from '../../lib/api';
import { InventoryItem } from '../../types';
import { Package, MessageSquare, AlertTriangle } from 'lucide-react';

const OtherAgenciesInventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowForm, setBorrowForm] = useState({
    quantity: 1,
    duration: 1,
    purpose: '',
    returnDate: ''
  });

  useEffect(() => {
    fetchOtherAgenciesInventory();
  }, []);

  const fetchOtherAgenciesInventory = async () => {
    try {
      const response = await inventoryAPI.getOtherAgenciesInventory();
      setInventoryItems(response.items);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory items. Please try again.');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !user?.agency?._id) return;

    try {
      const message = {
        recipientAgencyId: selectedItem.agency._id,
        subject: `Borrow Request: ${selectedItem.name}`,
        content: `Request to borrow ${borrowForm.quantity} units of ${selectedItem.name} for ${borrowForm.duration} days.
Purpose: ${borrowForm.purpose}
Expected Return Date: ${borrowForm.returnDate}`,
        type: 'borrow_request',
        metadata: {
          itemId: selectedItem._id,
          quantity: borrowForm.quantity,
          duration: borrowForm.duration,
          purpose: borrowForm.purpose,
          returnDate: borrowForm.returnDate
        }
      };

      await messageAPI.sendMessage(message);
      setShowBorrowForm(false);
      setSelectedItem(null);
      setBorrowForm({
        quantity: 1,
        duration: 1,
        purpose: '',
        returnDate: ''
      });
    } catch (err) {
      console.error('Error sending borrow request:', err);
      setError('Failed to send borrow request. Please try again.');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Available Inventory</h1>
          <p className="text-gray-600">Browse and request items from other agencies</p>
        </div>

        {inventoryItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items available</h3>
            <p className="mt-1 text-sm text-gray-500">Check back later for new inventory items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventoryItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.agency.name}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {item.quantity} available
                    </span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                  
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowBorrowForm(true);
                      }}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request to Borrow
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Borrow Request Modal */}
        {showBorrowForm && selectedItem && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Request to Borrow: {selectedItem.name}
              </h3>
              
              <form onSubmit={handleBorrowRequest} className="space-y-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={selectedItem.quantity}
                    value={borrowForm.quantity}
                    onChange={(e) => setBorrowForm({ ...borrowForm, quantity: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    min="1"
                    value={borrowForm.duration}
                    onChange={(e) => setBorrowForm({ ...borrowForm, duration: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                    Purpose
                  </label>
                  <textarea
                    id="purpose"
                    value={borrowForm.purpose}
                    onChange={(e) => setBorrowForm({ ...borrowForm, purpose: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">
                    Expected Return Date
                  </label>
                  <input
                    type="date"
                    id="returnDate"
                    value={borrowForm.returnDate}
                    onChange={(e) => setBorrowForm({ ...borrowForm, returnDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBorrowForm(false);
                      setSelectedItem(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtherAgenciesInventoryPage; 