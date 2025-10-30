import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { useAuth } from '../../context/AuthContext';
import { agencyAPI } from '../../lib/api';
import { Agency } from '../../types';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const MapPage: React.FC = () => {
  const { user } = useAuth();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [center, setCenter] = useState<LatLngTuple>([40.7128, -74.0060]); // Default to NYC
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await agencyAPI.getAllAgencies();
        setAgencies(response);
        
        // If user's agency has coordinates, center map there
        if (user) {
          const agencyId = typeof user.agency === 'string' ? user.agency : user.agency._id;
          const userAgency = response.find((a: Agency) => a._id === agencyId);
          if (userAgency && userAgency.location.coordinates) {
            setCenter([
              userAgency.location.coordinates[1],
              userAgency.location.coordinates[0]
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {agencies.map((agency) => (
          <React.Fragment key={agency._id}>
            <Marker
              position={[
                agency.location.coordinates[1],
                agency.location.coordinates[0]
              ]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-medium text-lg">{agency.name}</h3>
                  <Badge variant="primary" size="sm" className="mt-1">
                    {agency.type}
                  </Badge>
                  <p className="text-sm mt-2">{agency.description}</p>
                  <div className="mt-2 text-sm">
                    <p>
                      <strong>Contact:</strong> {agency.contactPhone}
                    </p>
                    <p>
                      <strong>Email:</strong> {agency.contactEmail}
                    </p>
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant={agency.active ? 'success' : 'error'}
                      size="sm"
                    >
                      {agency.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </Popup>
            </Marker>
            
            {/* Operational radius circle */}
            <Circle
              center={[
                agency.location.coordinates[1],
                agency.location.coordinates[0]
              ]}
              radius={5000} // 5km radius
              pathOptions={{
                color: agency._id === user?.agency ? '#2563eb' : '#64748b',
                fillColor: agency._id === user?.agency ? '#3b82f6' : '#94a3b8',
                fillOpacity: 0.2
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;