import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert as AlertType, Agency } from '../../types';
import { alertAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { Plus, AlertTriangle } from 'lucide-react';

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const getAgencyId = (agency: Agency | string): string => {
    if (typeof agency === 'string') {
      return agency;
    }
    return agency._id;
  };

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.agency) {
        throw new Error('No agency found');
      }

      const agencyId = getAgencyId(user.agency);
      const fetchedAlerts = await alertAPI.getAgencyAlerts(agencyId);
      
      // Filter out any malformed alerts
      const validAlerts = fetchedAlerts.filter(alert => {
        if (!alert?._id || !alert?.title || !alert?.message || !alert?.severity) {
          return false;
        }
        return true;
      });
      
      setAlerts(validAlerts);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user?.agency]);

  useEffect(() => {
    if (user?.agency) {
      fetchAlerts();
    }
  }, [fetchAlerts]);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await alertAPI.markAlertAsRead(alertId);
      // Update the local state to reflect the change
      setAlerts(prevAlerts =>
        prevAlerts.map(alert =>
          alert._id === alertId
            ? { ...alert, isRead: true, readAt: new Date() }
            : alert
        )
      );
    } catch (err) {
      console.error('Error marking alert as read:', err);
      setError('Failed to mark alert as read. Please try again later.');
    }
  };

  const handleCreateAlert = () => {
    navigate('/alerts/new');
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const renderAlertCard = (alert: AlertType) => {
    if (!alert?._id || !alert?.title || !alert?.message || !alert?.severity) {
      return null;
    }

    return (
      <div
        key={alert._id}
        className={`p-4 rounded-lg border ${
          alert.isRead ? 'bg-gray-50' : 'bg-white'
        } ${
          alert.severity === 'critical'
            ? 'border-red-500'
            : alert.severity === 'high'
            ? 'border-orange-500'
            : alert.severity === 'medium'
            ? 'border-yellow-500'
            : 'border-blue-500'
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {alert.title}
            </h3>
            {alert.sender?.name && (
              <p className="text-sm text-gray-600 mt-1">
                From: {alert.sender.name}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                alert.severity === 'critical'
                  ? 'bg-red-100 text-red-800'
                  : alert.severity === 'high'
                  ? 'bg-orange-100 text-orange-800'
                  : alert.severity === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {alert.severity}
            </span>
            {!alert.isRead && (
              <Button
                onClick={() => handleMarkAsRead(alert._id)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600"
                size="sm"
              >
                Mark as Read
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-gray-700">{alert.message}</p>
        <div className="mt-2 text-sm text-gray-500">
          <span>
            Created:{' '}
            {new Date(alert.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {alert.isRead && alert.readAt && (
            <span className="ml-4">
              Read:{' '}
              {new Date(alert.readAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alerts</h1>
          <p className="text-gray-600">Manage emergency alerts</p>
        </div>
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <Button
            onClick={handleCreateAlert}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            icon={<Plus size={16} />}
          >
            Create Alert
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No alerts found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => renderAlertCard(alert))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;