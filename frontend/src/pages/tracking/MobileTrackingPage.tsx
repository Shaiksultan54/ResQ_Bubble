import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MapPin, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Navigation,
  Phone,
  Shield
} from 'lucide-react';
import { transferAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Transfer } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';

const MobileTrackingPage: React.FC = () => {
  const { transferId } = useParams<{ transferId: string }>();
  const { user } = useAuth();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    const fetchTransfer = async () => {
      try {
        if (transferId) {
          const response = await transferAPI.getTransferById(transferId);
          setTransfer(response);
        }
      } catch (err) {
        setError('Failed to load transfer details');
        console.error('Error fetching transfer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfer();
  }, [transferId]);

  useEffect(() => {
    // Start GPS tracking
    if (navigator.geolocation && transfer) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setLocation(position);
          updateLocation(position);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to access GPS location');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
      
      setWatchId(id);
      
      return () => {
        navigator.geolocation.clearWatch(id);
      };
    }
  }, [transfer]);

  const updateLocation = async (position: GeolocationPosition) => {
    if (!transfer || updating) return;
    
    try {
      setUpdating(true);
      await transferAPI.updateLocation(transfer._id, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed || 0,
        heading: position.coords.heading || 0
      });
    } catch (err) {
      console.error('Error updating location:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!transfer) return;
    
    try {
      await transferAPI.updateStatus(transfer._id, { status });
      setTransfer({ ...transfer, status });
    } catch (err) {
      setError('Failed to update status');
      console.error('Error updating status:', err);
    }
  };

  const handleEmergencyAlert = async () => {
    if (!transfer || !location || !emergencyMessage.trim()) return;
    
    try {
      await transferAPI.sendEmergencyAlert(transfer._id, {
        message: emergencyMessage,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      setEmergencyMessage('');
      setShowEmergency(false);
      alert('Emergency alert sent successfully!');
    } catch (err) {
      setError('Failed to send emergency alert');
      console.error('Error sending emergency alert:', err);
    }
  };

  const takePhoto = async (type: string) => {
    if (!transfer || !location) return;
    
    try {
      // In a real app, this would open camera and upload photo
      const photoUrl = 'https://via.placeholder.com/400x300?text=Photo+Taken';
      
      await transferAPI.addPhoto(transfer._id, {
        photoUrl,
        type,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        notes: `Photo taken during ${type}`
      });
      
      alert('Photo uploaded successfully!');
    } catch (err) {
      setError('Failed to upload photo');
      console.error('Error uploading photo:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <Alert
          type="error"
          message="Transfer not found"
          icon={<AlertTriangle size={16} />}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <Card title="Transfer Tracking">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">
              {typeof transfer.item === 'string' ? transfer.item : transfer.item.name}
            </h2>
            <p className="text-sm text-gray-500">Transfer ID: {transfer.transferId}</p>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <Badge
              variant={transfer.status === 'in-transit' ? 'primary' : 'secondary'}
              size="lg"
            >
              {transfer.status}
            </Badge>
            <Badge
              variant={transfer.priority === 'critical' ? 'error' : 'warning'}
              size="lg"
            >
              {transfer.priority}
            </Badge>
          </div>
          
          {location && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">GPS Active</span>
              </div>
              <div className="text-sm text-green-700 mt-1">
                Location: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
              </div>
              {location.coords.speed && (
                <div className="text-sm text-green-700">
                  Speed: {(location.coords.speed * 3.6).toFixed(1)} km/h
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {error && (
        <Alert
          type="error"
          message={error}
          icon={<AlertTriangle size={16} />}
          onDismiss={() => setError('')}
        />
      )}

      <Card title="Quick Actions">
        <div className="space-y-3">
          {transfer.status === 'dispatched' && (
            <Button
              variant="primary"
              className="w-full"
              icon={<Navigation size={16} />}
              onClick={() => handleStatusUpdate('in-transit')}
            >
              Start Journey
            </Button>
          )}
          
          {transfer.status === 'in-transit' && (
            <Button
              variant="success"
              className="w-full"
              icon={<CheckCircle size={16} />}
              onClick={() => handleStatusUpdate('delivered')}
            >
              Mark as Delivered
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              icon={<Camera size={16} />}
              onClick={() => takePhoto('transit')}
            >
              Take Photo
            </Button>
            
            <Button
              variant="warning"
              icon={<AlertTriangle size={16} />}
              onClick={() => setShowEmergency(true)}
            >
              Emergency
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Transfer Details">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium text-gray-500">From</div>
            <div className="text-sm text-gray-900">
              {typeof transfer.fromAgency === 'string' 
                ? transfer.fromAgency 
                : transfer.fromAgency.name
              }
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">To</div>
            <div className="text-sm text-gray-900">
              {typeof transfer.toAgency === 'string' 
                ? transfer.toAgency 
                : transfer.toAgency.name
              }
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Quantity</div>
            <div className="text-sm text-gray-900">{transfer.quantity}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Expected Delivery</div>
            <div className="text-sm text-gray-900">
              {new Date(transfer.estimatedDeliveryTime).toLocaleString()}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Security Code</div>
            <div className="text-lg font-mono text-gray-900 bg-gray-100 px-3 py-2 rounded text-center">
              {transfer.securityCode}
            </div>
          </div>
          
          {transfer.specialInstructions && (
            <div>
              <div className="text-sm font-medium text-gray-500">Special Instructions</div>
              <div className="text-sm text-gray-900">{transfer.specialInstructions}</div>
            </div>
          )}
        </div>
      </Card>

      <Card title="Emergency Contacts">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Dispatcher</span>
            <Button variant="outline" size="sm" icon={<Phone size={14} />}>
              Call
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Destination Agency</span>
            <Button variant="outline" size="sm" icon={<Phone size={14} />}>
              Call
            </Button>
          </div>
        </div>
      </Card>

      {/* Emergency Alert Modal */}
      {showEmergency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Emergency Alert
            </h3>
            
            <textarea
              rows={3}
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
              placeholder="Describe the emergency situation..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-error-500 focus:border-error-500 sm:text-sm mb-4"
            />
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEmergency(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleEmergencyAlert}
                disabled={!emergencyMessage.trim()}
              >
                Send Alert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileTrackingPage;