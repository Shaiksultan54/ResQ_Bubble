import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Edit,
  Trash2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Users
} from 'lucide-react';
import { inventoryAPI, borrowAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { InventoryItem, Borrow } from '../../types';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const InventoryItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [borrowHistory, setBorrowHistory] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        if (id) {
          const [itemData, historyData] = await Promise.all([
            inventoryAPI.getInventoryItemById(id),
            borrowAPI.getItemBorrowHistory(id)
          ]);
          setItem(itemData);
          setBorrowHistory(historyData);
        }
      } catch (err) {
        setError('Failed to load item data');
        console.error('Error fetching item data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await inventoryAPI.deleteInventoryItem(id!);
      navigate('/inventory');
    } catch (err) {
      setError('Failed to delete item');
      console.error('Error deleting item:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

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

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert
          type="error"
          message="Item not found"
          icon={<AlertTriangle size={16} />}
        />
      </div>
    );
  }

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

      {error && (
        <Alert
          type="error"
          message={error}
          icon={<AlertTriangle size={16} />}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-100 rounded-full">
                  <Package size={24} className="text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                  <div className="mt-2 flex items-center space-x-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </div>
              {user?.agency === (typeof item.agency === 'string' ? item.agency : item.agency._id) && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    icon={<Edit size={16} />}
                    onClick={() => navigate(`/inventory/${id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    icon={<Trash2 size={16} />}
                    onClick={handleDelete}
                    isLoading={deleteLoading}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Details</h3>
              <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {item.quantity} {item.unit}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {item.location || 'Not specified'}
                  </dd>
                </div>

                {item.expiryDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Expiry Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}

                {item.currentHolder && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Current Holder
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {typeof item.currentHolder.agency === 'string'
                        ? item.currentHolder.agency
                        : item.currentHolder.agency.name}
                      <br />
                      <span className="text-gray-500">
                        Since:{' '}
                        {new Date(item.currentHolder.since).toLocaleDateString()}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>

              {item.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Description
                  </h3>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Tags</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="primary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Borrow History" className="mt-8">
            {borrowHistory.length > 0 ? (
              <div className="space-y-6">
                {borrowHistory.map((borrow) => (
                  <div
                    key={borrow._id}
                    className="flex items-start space-x-4 border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="p-2 bg-primary-100 rounded-full">
                      <Users size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {typeof borrow.borrowerAgency === 'string'
                            ? borrow.borrowerAgency
                            : borrow.borrowerAgency.name}
                        </div>
                        <Badge
                          variant={getStatusColor(borrow.status)}
                          size="sm"
                        >
                          {borrow.status}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Quantity: {borrow.quantity}
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1" />
                          Borrowed:{' '}
                          {new Date(borrow.borrowDate).toLocaleDateString()}
                        </div>
                        {borrow.actualReturnDate && (
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            Returned:{' '}
                            {new Date(borrow.actualReturnDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock size={48} className="mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  No borrow history available
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card title="Actions">
            {item.status === 'available' ? (
              <Link to={`/borrow/new?item=${item._id}`}>
                <Button
                  variant="primary"
                  className="w-full"
                  icon={<Clock size={16} />}
                >
                  Request to Borrow
                </Button>
              </Link>
            ) : (
              <div className="text-center text-gray-500">
                <Package size={48} className="mx-auto text-gray-400" />
                <p className="mt-2">
                  This item is currently {item.status.toLowerCase()} and cannot be
                  borrowed
                </p>
              </div>
            )}
          </Card>

          <Card title="Item Statistics" className="mt-6">
            <dl className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">
                  Total Times Borrowed
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {borrowHistory.length}
                </dd>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">
                  Current Status
                </dt>
                <dd className="mt-1">
                  <Badge variant={getStatusColor(item.status)} size="lg">
                    {item.status}
                  </Badge>
                </dd>
              </div>

              {item.currentHolder && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">
                    Days with Current Holder
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(item.currentHolder.since).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InventoryItemPage;