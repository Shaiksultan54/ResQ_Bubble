import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { 
  Truck, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Package, 
  User,
  Phone,
  Camera,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import { transferAPI } from '../../lib/api';
import { Transfer } from '../../types';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const TrackingPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocketContext();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [center, setCenter] = useState<LatLngTuple>([40.7128, -74.0060]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActiveTransfers = async () => {
      try {
        if (user) {
          const agencyId = typeof user.agency === 'string' ? user.agency : user.agency._id;
          const response = await transferAPI.getActiveTransfers(agencyId);
          setTransfers(response);
          
          // Set map center to first transfer or user agency
          if (response.length > 0 && response[0].route.currentLocation) {
            const coords = response[0].route.currentLocation.coordinates;
            setCenter([coords[1], coords[0]]);
          }
        }
      } catch (err) {
        setError('Failed to load transfers');
        console.error('Error fetching transfers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTransfers();
  }, [user]);

  useEffect(() => {
    if (socket) {
      // Listen for real-time location updates
      socket.on('location-update', (data) => {
        setTransfers(prev => prev.map(transfer => 
          transfer._id === data.transferId 
            ? { ...transfer, route: { ...transfer.route, currentLocation: data.location } }
            : transfer
        ));
      });

      // Listen for status updates
      socket.on('transfer-status-update', (data) => {
        setTransfers(prev => prev.map(transfer => 
          transfer._id === data.transferId 
            ? { ...transfer, status: data.status }
            : transfer
        ));
      });

      // Listen for emergency alerts
      socket.on('transfer-emergency', (data) => {
        // Show emergency notification
        alert(`EMERGENCY ALERT: ${data.message}\nStaff: ${data.staff}\nTransfer: ${data.transferId}`);
      });

      return () => {
        socket.off('location-update');
        socket.off('transfer-status-update');
        socket.off('transfer-emergency');
      };
    }
  }, [socket]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched':
        return 'warning';
      case 'in-transit':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const calculateDistance = (coord1: [number, number], coord2: [number, number]) => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getRoutePolyline = (transfer: Transfer) => {
    const points: LatLngTuple[] = [];
    
    // Start location
    if (transfer.route.startLocation) {
      points.push([
        transfer.route.startLocation.coordinates[1],
        transfer.route.startLocation.coordinates[0]
      ]);
    }
    
    // Waypoints
    transfer.route.waypoints?.forEach(waypoint => {
      points.push([
        waypoint.location.coordinates[1],
        waypoint.location.coordinates[0]
      ]);
    });
    
    // Current location
    if (transfer.route.currentLocation) {
      points.push([
        transfer.route.currentLocation.coordinates[1],
        transfer.route.currentLocation.coordinates[0]
      ]);
    }
    
    return points;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Live Tracking</h1>
          
          {error && (
            <Alert
              type="error"
              message={error}
              className="mb-4"
            />
          )}

          <div className="space-y-4">
            {transfers.map((transfer) => (
              <Card
                key={transfer._id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedTransfer?._id === transfer._id 
                    ? 'ring-2 ring-primary-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTransfer(transfer)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    transfer.priority === 'critical' ? 'bg-error-100' :
                    transfer.priority === 'high' ? 'bg-warning-100' :
                    'bg-primary-100'
                  }`}>
                    <Truck size={20} className={
                      transfer.priority === 'critical' ? 'text-error-600' :
                      transfer.priority === 'high' ? 'text-warning-600' :
                      'text-primary-600'
                    } />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {typeof transfer.item === 'string' ? transfer.item : transfer.item.name}
                      </h3>
                      <Badge
                        variant={getStatusColor(transfer.status)}
                        size="sm"
                        rounded
                      >
                        {transfer.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <User size={12} className="mr-1" />
                      {typeof transfer.assignedStaff === 'string' 
                        ? transfer.assignedStaff 
                        : `${transfer.assignedStaff.firstName} ${transfer.assignedStaff.lastName}`
                      }
                    </div>
                    
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <MapPin size={12} className="mr-1" />
                      {typeof transfer.fromAgency === 'string' 
                        ? transfer.fromAgency 
                        : transfer.fromAgency.name
                      } → {typeof transfer.toAgency === 'string' 
                        ? transfer.toAgency 
                        : transfer.toAgency.name
                      }
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <Badge
                        variant={getPriorityColor(transfer.priority)}
                        size="sm"
                      >
                        {transfer.priority}
                      </Badge>
                      
                      {transfer.route.currentLocation && (
                        <div className="text-xs text-gray-500">
                          Last update: {new Date(transfer.route.currentLocation.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {transfers.length === 0 && (
              <div className="text-center py-8">
                <Truck size={48} className="mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No active transfers
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  All transfers are completed or none are currently active
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {transfers.map((transfer) => (
            <React.Fragment key={transfer._id}>
              {/* Route polyline */}
              <Polyline
                positions={getRoutePolyline(transfer)}
                color={transfer.priority === 'critical' ? '#dc2626' : '#2563eb'}
                weight={4}
                opacity={0.7}
              />
              
              {/* Start location */}
              {transfer.route.startLocation && (
                <Marker
                  position={[
                    transfer.route.startLocation.coordinates[1],
                    transfer.route.startLocation.coordinates[0]
                  ]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-medium">Start Location</h3>
                      <p className="text-sm">
                        {typeof transfer.fromAgency === 'string' 
                          ? transfer.fromAgency 
                          : transfer.fromAgency.name
                        }
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* End location */}
              {transfer.route.endLocation && (
                <Marker
                  position={[
                    transfer.route.endLocation.coordinates[1],
                    transfer.route.endLocation.coordinates[0]
                  ]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-medium">Destination</h3>
                      <p className="text-sm">
                        {typeof transfer.toAgency === 'string' 
                          ? transfer.toAgency 
                          : transfer.toAgency.name
                        }
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Current location */}
              {transfer.route.currentLocation && (
                <>
                  <Marker
                    position={[
                      transfer.route.currentLocation.coordinates[1],
                      transfer.route.currentLocation.coordinates[0]
                    ]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-medium">
                          {typeof transfer.item === 'string' ? transfer.item : transfer.item.name}
                        </h3>
                        <p className="text-sm">
                          Staff: {typeof transfer.assignedStaff === 'string' 
                            ? transfer.assignedStaff 
                            : `${transfer.assignedStaff.firstName} ${transfer.assignedStaff.lastName}`
                          }
                        </p>
                        <p className="text-sm">
                          Status: {transfer.status}
                        </p>
                        {transfer.route.currentLocation.speed && (
                          <p className="text-sm">
                            Speed: {transfer.route.currentLocation.speed} km/h
                          </p>
                        )}
                        <p className="text-sm">
                          Last update: {new Date(transfer.route.currentLocation.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Accuracy circle */}
                  <Circle
                    center={[
                      transfer.route.currentLocation.coordinates[1],
                      transfer.route.currentLocation.coordinates[0]
                    ]}
                    radius={100}
                    pathOptions={{
                      color: transfer.priority === 'critical' ? '#dc2626' : '#2563eb',
                      fillColor: transfer.priority === 'critical' ? '#fca5a5' : '#93c5fd',
                      fillOpacity: 0.2
                    }}
                  />
                </>
              )}
              
              {/* Waypoints */}
              {transfer.route.waypoints?.map((waypoint, index) => (
                <Marker
                  key={index}
                  position={[
                    waypoint.location.coordinates[1],
                    waypoint.location.coordinates[0]
                  ]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-medium">Waypoint {index + 1}</h3>
                      <p className="text-sm">Event: {waypoint.event}</p>
                      <p className="text-sm">
                        Time: {new Date(waypoint.timestamp).toLocaleString()}
                      </p>
                      {waypoint.notes && (
                        <p className="text-sm">Notes: {waypoint.notes}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Transfer details overlay */}
        {selectedTransfer && (
          <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Transfer Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTransfer(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-500">Item</div>
                <div className="text-sm text-gray-900">
                  {typeof selectedTransfer.item === 'string' 
                    ? selectedTransfer.item 
                    : selectedTransfer.item.name
                  }
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">Assigned Staff</div>
                <div className="text-sm text-gray-900">
                  {typeof selectedTransfer.assignedStaff === 'string' 
                    ? selectedTransfer.assignedStaff 
                    : `${selectedTransfer.assignedStaff.firstName} ${selectedTransfer.assignedStaff.lastName}`
                  }
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">Status</div>
                <Badge
                  variant={getStatusColor(selectedTransfer.status)}
                  size="sm"
                >
                  {selectedTransfer.status}
                </Badge>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">Priority</div>
                <Badge
                  variant={getPriorityColor(selectedTransfer.priority)}
                  size="sm"
                >
                  {selectedTransfer.priority}
                </Badge>
              </div>
              
              {selectedTransfer.route.currentLocation && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Current Location</div>
                  <div className="text-sm text-gray-900">
                    {selectedTransfer.route.currentLocation.coordinates[1].toFixed(6)}, {selectedTransfer.route.currentLocation.coordinates[0].toFixed(6)}
                  </div>
                  {selectedTransfer.route.currentLocation.speed && (
                    <div className="text-sm text-gray-500">
                      Speed: {selectedTransfer.route.currentLocation.speed} km/h
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium text-gray-500">Security Code</div>
                <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {selectedTransfer.securityCode}
                </div>
              </div>
              
              {selectedTransfer.specialInstructions && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Special Instructions</div>
                  <div className="text-sm text-gray-900">
                    {selectedTransfer.specialInstructions}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;