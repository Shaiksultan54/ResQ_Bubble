import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { borrowAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Borrow } from '../../types';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Input from '../../components/common/Input';

interface ApprovalData {
  status: 'approved' | 'rejected' | 'returned';
  notes?: string;
  condition?: {
    afterReturn?: {
      description: string;
      images?: string[];
    };
  };
}

const BorrowRequestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [borrowRequest, setBorrowRequest] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchBorrowRequest = async () => {
      try {
        if (id) {
          const response = await borrowAPI.getBorrowById(id);
          setBorrowRequest(response);
        }
      } catch (err) {
        setError('Failed to load borrow request');
        console.error('Error fetching borrow request:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowRequest();
  }, [id]);

  const handleStatusUpdate = async (status: 'approved' | 'rejected' | 'returned') => {
    try {
      setUpdateLoading(true);
      setError('');
      setSuccessMessage('');
      
      const response = await borrowAPI.updateBorrowStatus(id!, { status });
      setBorrowRequest(response);
      
      setSuccessMessage(`Request ${status} successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(`Failed to ${status} request`);
      console.error('Error updating status:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const ReturnForm: React.FC<{
    onSubmit: (data: ApprovalData) => void;
  }> = ({ onSubmit }) => {
    const [condition, setCondition] = useState('');
    const [notes, setNotes] = useState('');
    
    const handleSubmit = () => {
      onSubmit({
        status: 'returned',
        notes,
        condition: {
          afterReturn: {
            description: condition
          }
        }
      });
    };
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Return Condition
          </label>
          <textarea
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            rows={3}
            placeholder="Describe the condition of the returned item"
          />
        </div>
        
        <Input
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about the return"
        />
        
        <Button
          variant="primary"
          className="w-full"
          onClick={handleSubmit}
        >
          Confirm Return
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!borrowRequest) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert
          type="error"
          message="Borrow request not found"
        />
      </div>
    );
  }

  const isOwner =
    user?.agency &&
    borrowRequest?.ownerAgency &&
    (
      (typeof user.agency === 'string' && typeof borrowRequest.ownerAgency === 'string' && user.agency === borrowRequest.ownerAgency) ||
      (typeof user.agency === 'object' && typeof borrowRequest.ownerAgency === 'object' && user.agency._id === borrowRequest.ownerAgency._id) ||
      (typeof user.agency === 'string' && typeof borrowRequest.ownerAgency === 'object' && user.agency === borrowRequest.ownerAgency._id) ||
      (typeof user.agency === 'object' && typeof borrowRequest.ownerAgency === 'string' && user.agency._id === borrowRequest.ownerAgency)
    );

  console.log('Owner check:', {
    userAgency: user?.agency,
    ownerAgency: borrowRequest?.ownerAgency,
    isOwner
  });

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/borrow')}
        >
          Back to Requests
        </Button>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Borrow Request Details">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-gray-900">
                  {typeof borrowRequest.item === 'string'
                    ? borrowRequest.item
                    : borrowRequest.item.name}
                </h2>
                <Badge
                  variant={getStatusColor(borrowRequest.status)}
                  size="lg"
                  rounded
                >
                  {borrowRequest.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Owner Agency</div>
                  <div className="mt-1 flex items-center">
                    <Users size={16} className="text-gray-400 mr-1" />
                    <span className="text-gray-900">
                      {typeof borrowRequest.ownerAgency === 'string'
                        ? borrowRequest.ownerAgency
                        : borrowRequest.ownerAgency.name}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Borrower Agency</div>
                  <div className="mt-1 flex items-center">
                    <Users size={16} className="text-gray-400 mr-1" />
                    <span className="text-gray-900">
                      {typeof borrowRequest.borrowerAgency === 'string'
                        ? borrowRequest.borrowerAgency
                        : borrowRequest.borrowerAgency.name}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Purpose</div>
                <p className="mt-1 text-gray-900">{borrowRequest.purpose}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Quantity</div>
                  <div className="mt-1 text-gray-900">{borrowRequest.quantity}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="mt-1 text-gray-900">{borrowRequest.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Borrow Date</div>
                  <div className="mt-1 flex items-center">
                    <Clock size={16} className="text-gray-400 mr-1" />
                    <span className="text-gray-900">
                      {new Date(borrowRequest.borrowDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Expected Return</div>
                  <div className="mt-1 flex items-center">
                    <Clock size={16} className="text-gray-400 mr-1" />
                    <span className="text-gray-900">
                      {new Date(borrowRequest.expectedReturnDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {borrowRequest.status === 'returned' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Actual Return Date</div>
                    <div className="mt-1 flex items-center">
                      <Clock size={16} className="text-gray-400 mr-1" />
                      <span className="text-gray-900">
                        {borrowRequest.actualReturnDate
                          ? new Date(borrowRequest.actualReturnDate).toLocaleDateString()
                          : 'Not yet returned'}
                      </span>
                    </div>
                  </div>
                  {borrowRequest.condition && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">Return Condition</div>
                      <div className="mt-1 text-gray-900">
                        {borrowRequest.condition.afterReturn?.description || 'No condition details provided'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {borrowRequest.notes && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Notes</div>
                  <p className="mt-1 text-gray-900">{borrowRequest.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card title="Actions">
            {borrowRequest.status === 'pending' && isOwner && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Pending Approval
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Please review the request details and either approve or reject this borrow request.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="success"
                  className="w-full"
                  icon={<CheckCircle size={16} />}
                  onClick={() => handleStatusUpdate('approved')}
                  isLoading={updateLoading}
                >
                  Approve Request
                </Button>
                <Button
                  variant="danger"
                  className="w-full"
                  icon={<XCircle size={16} />}
                  onClick={() => handleStatusUpdate('rejected')}
                  isLoading={updateLoading}
                >
                  Reject Request
                </Button>
              </div>
            )}

            {borrowRequest.status === 'approved' && isOwner && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Request Approved
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          The borrower can now collect the items. Mark as returned when items are received back.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <ReturnForm onSubmit={(data) => handleStatusUpdate(data.status)} />
              </div>
            )}

            {borrowRequest.status === 'approved' && !isOwner && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Package className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Request Approved
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Please return the items by{' '}
                        {new Date(borrowRequest.expectedReturnDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {['rejected', 'returned'].includes(borrowRequest.status) && (
              <div className={`bg-${borrowRequest.status === 'returned' ? 'green' : 'red'}-50 border border-${borrowRequest.status === 'returned' ? 'green' : 'red'}-200 rounded-lg p-4`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {borrowRequest.status === 'returned' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium text-${borrowRequest.status === 'returned' ? 'green' : 'red'}-800`}>
                      Request {borrowRequest.status.charAt(0).toUpperCase() + borrowRequest.status.slice(1)}
                    </h3>
                    <div className={`mt-2 text-sm text-${borrowRequest.status === 'returned' ? 'green' : 'red'}-700`}>
                      <p>
                        {borrowRequest.status === 'returned'
                          ? 'Items have been returned successfully.'
                          : 'This request has been rejected.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card title="Request Timeline" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-6">
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-600"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Request Created
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(borrowRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {borrowRequest.status !== 'pending' && (
                <div className="flex items-start">
                  <div className="flex items-center h-6">
                    <div className="relative flex items-center justify-center w-6 h-6">
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        borrowRequest.status === 'approved' ? 'bg-success-600' : 'bg-error-600'
                      }`}></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Request {borrowRequest.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      {borrowRequest.approvedBy
                        ? `By ${
                            typeof borrowRequest.approvedBy === 'string'
                              ? borrowRequest.approvedBy
                              : `${borrowRequest.approvedBy.firstName} ${borrowRequest.approvedBy.lastName}`
                          }`
                        : 'Status updated'}
                    </p>
                  </div>
                </div>
              )}

              {borrowRequest.status === 'returned' && (
                <div className="flex items-start">
                  <div className="flex items-center h-6">
                    <div className="relative flex items-center justify-center w-6 h-6">
                      <div className="h-1.5 w-1.5 rounded-full bg-success-600"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Item Returned
                    </p>
                    <p className="text-sm text-gray-500">
                      {borrowRequest.actualReturnDate
                        ? new Date(borrowRequest.actualReturnDate).toLocaleString()
                        : 'Date not recorded'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BorrowRequestPage;