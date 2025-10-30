import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Package, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { borrowAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Borrow } from '../../types';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'returned', label: 'Returned' },
  { value: 'overdue', label: 'Overdue' }
];

const BorrowPage: React.FC = () => {
  const { user } = useAuth();
  const [borrowRequests, setBorrowRequests] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBorrowRequests = async () => {
      try {
        if (user) {
          const agencyId = typeof user.agency === 'string' ? user.agency : user.agency._id;
          const response = await borrowAPI.getAllBorrowRequests({
            agency: agencyId,
            status: selectedStatus
          });
          setBorrowRequests(response);
        }
      } catch (err) {
        setError('Failed to load borrow requests');
        console.error('Error fetching borrow requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowRequests();
  }, [user, selectedStatus]);

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected' | 'returned') => {
    try {
      setUpdatingId(requestId);
      const response = await borrowAPI.updateBorrowStatus(requestId, { status });
      setBorrowRequests(prev => 
        prev.map(request => 
          request._id === requestId ? response : request
        )
      );
    } catch (err) {
      setError('Failed to update request status');
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'overdue':
        return 'warning';
      case 'returned':
        return 'secondary';
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Borrow Requests</h1>
        <p className="text-gray-600">Manage resource borrowing requests</p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}

      <div className="mb-8">
        <Select
          options={statusOptions}
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(value)}
          placeholder="Filter by status"
        />
      </div>

      <div className="space-y-6">
        {borrowRequests.map((request) => {
          const isOwner = user?.agency === (
            typeof request.ownerAgency === 'string'
              ? request.ownerAgency
              : request.ownerAgency._id
          );

          return (
            <Card key={request._id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-100 rounded-full">
                  <Package size={24} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      {typeof request.item === 'string'
                        ? request.item
                        : request.item.name}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={getStatusColor(request.status)}
                        size="sm"
                        rounded
                      >
                        {request.status}
                      </Badge>
                      {request.status === 'pending' && isOwner && (
                        <div className="flex space-x-2">
                          <Button
                            variant="success"
                            size="sm"
                            icon={<CheckCircle size={16} />}
                            onClick={() => handleStatusUpdate(request._id, 'approved')}
                            isLoading={updatingId === request._id}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<XCircle size={16} />}
                            onClick={() => handleStatusUpdate(request._id, 'rejected')}
                            isLoading={updatingId === request._id}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users size={16} className="mr-1" />
                        Owner:{' '}
                        {typeof request.ownerAgency === 'string'
                          ? request.ownerAgency
                          : request.ownerAgency.name}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Users size={16} className="mr-1" />
                        Borrower:{' '}
                        {typeof request.borrowerAgency === 'string'
                          ? request.borrowerAgency
                          : request.borrowerAgency.name}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock size={16} className="mr-1" />
                        Requested:{' '}
                        {new Date(request.borrowDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock size={16} className="mr-1" />
                        Expected Return:{' '}
                        {new Date(request.expectedReturnDate).toLocaleDateString()}
                      </div>
                      {request.status === 'returned' && request.actualReturnDate && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock size={16} className="mr-1" />
                          Actual Return:{' '}
                          {new Date(request.actualReturnDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      Quantity: {request.quantity}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Purpose: {request.purpose}
                    </div>
                  </div>

                  {request.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      Notes: {request.notes}
                    </div>
                  )}

                  <div className="mt-4">
                    <Link
                      to={`/borrow/${request._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {borrowRequests.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No borrow requests found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus
                ? `No requests with status "${selectedStatus}"`
                : 'No active borrow requests'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowPage;