import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  ChevronRight,
  Map as MapIcon
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { 
  inventoryAPI, 
  agencyAPI, 
  borrowAPI, 
  alertAPI, 
  messageAPI 
} from '../lib/api';
import { Alert, InventoryItem, Agency, Borrow, Message } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [inventorySummary, setInventorySummary] = useState<{
    total: number;
    available: number;
    borrowed: number;
  }>({ total: 0, available: 0, borrowed: 0 });
  const [nearbyAgencies, setNearbyAgencies] = useState<Agency[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Borrow[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user && user.agency) {
          const agencyId = typeof user.agency === 'string' ? user.agency : user.agency._id;
          
          // Fetch inventory summary
          const inventory = await inventoryAPI.getAgencyInventory(agencyId);
          const summary = {
            total: inventory.length,
            available: inventory.filter(item => item.status === 'available').length,
            borrowed: inventory.filter(item => item.status === 'borrowed').length
          };
          setInventorySummary(summary);

          // Fetch nearby agencies (default 20km radius)
          // Mock coordinates - in real app would use geolocation
          const agencies = await agencyAPI.getNearbyAgencies(20, -73.935242, 40.730610);
          setNearbyAgencies(agencies.filter((a: { _id: string; }) => a._id !== agencyId).slice(0, 5));

          // Fetch pending borrow requests
          const borrowRequests = await borrowAPI.getAllBorrowRequests({ 
            status: 'pending',
            agency: agencyId 
          });
          setPendingRequests(borrowRequests.slice(0, 5));

          // Fix alerts fetch
          const alertsResponse = await alertAPI.getAgencyAlerts(agencyId);
          const alertsData = alertsResponse?.data || [];
          setRecentAlerts(Array.isArray(alertsData) ? alertsData.slice(0, 3) : []);

          // Fetch recent messages
          const messages = await messageAPI.getAgencyMessages(agencyId);
          setRecentMessages(messages.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Inventory</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{inventorySummary.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/inventory" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                View inventory
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </Card>

        <Card className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">All Agencies Inventory</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">Browse All</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/inventory/all-agencies" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                View all agencies inventory
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </Card>

        <Card className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Nearby Agencies</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{nearbyAgencies.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/agencies" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                View agencies
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </Card>

        <Card className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-warning-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Alerts</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{recentAlerts.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/alerts" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                View alerts
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </Card>

        <Card className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-secondary-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{pendingRequests.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/borrow" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                View requests
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick access section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link to="/inventory" className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow">
            <Package size={24} className="mx-auto mb-2 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Inventory</span>
          </Link>
          <Link to="/map" className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow">
            <MapIcon size={24} className="mx-auto mb-2 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Map</span>
          </Link>
          <Link to="/agencies" className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow">
            <Users size={24} className="mx-auto mb-2 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Agencies</span>
          </Link>
          <Link to="/messages" className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow">
            <MessageSquare size={24} className="mx-auto mb-2 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Messages</span>
          </Link>
          <Link to="/alerts" className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow">
            <AlertTriangle size={24} className="mx-auto mb-2 text-warning-500" />
            <span className="text-sm font-medium text-gray-700">Alerts</span>
          </Link>
          <Link to="/borrow" className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow">
            <Clock size={24} className="mx-auto mb-2 text-secondary-500" />
            <span className="text-sm font-medium text-gray-700">Requests</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent alerts */}
        <Card title="Recent Alerts" className="shadow">
          {recentAlerts.length > 0 ? (
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert._id} className="flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className={`p-2 rounded-full ${
                    alert.severity === 'critical' ? 'bg-error-100' : 
                    alert.severity === 'high' ? 'bg-secondary-100' : 
                    alert.severity === 'medium' ? 'bg-warning-100' : 'bg-primary-100'
                  }`}>
                    <AlertTriangle size={20} className={
                      alert.severity === 'critical' ? 'text-error-600' : 
                      alert.severity === 'high' ? 'text-secondary-600' : 
                      alert.severity === 'medium' ? 'text-warning-600' : 'text-primary-600'
                    } />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <Badge 
                        variant={
                          alert.severity === 'critical' ? 'error' : 
                          alert.severity === 'high' ? 'secondary' : 
                          alert.severity === 'medium' ? 'warning' : 'primary'
                        }
                        size="sm"
                        rounded
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      From: {typeof alert.sender === 'string' ? alert.sender : alert.sender.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent alerts</p>
          )}
          {recentAlerts.length > 0 && (
            <div className="mt-4">
              <Link to="/alerts">
                <Button variant="outline" size="sm" className="w-full">
                  View all alerts
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Pending requests */}
        <Card title="Pending Requests" className="shadow">
          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request._id} className="flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="p-2 rounded-full bg-secondary-100">
                    <Clock size={20} className="text-secondary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {typeof request.item === 'string' ? request.item : request.item.name}
                      </h4>
                      <Badge variant="secondary" size="sm" rounded>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {typeof request.borrowerAgency === 'string' 
                        ? `Agency: ${request.borrowerAgency}`
                        : `Agency: ${request.borrowerAgency.name}`
                      }
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      Quantity: {request.quantity} • Expected Return: {new Date(request.expectedReturnDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending requests</p>
          )}
          {pendingRequests.length > 0 && (
            <div className="mt-4">
              <Link to="/borrow">
                <Button variant="outline" size="sm" className="w-full">
                  View all requests
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;