import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { agencyAPI } from '../../lib/api';
import { Agency } from '../../types';
import { MapPin, Phone, Mail, AlertTriangle } from 'lucide-react';

const NearbyAgenciesPage: React.FC = () => {
  const { user } = useAuth();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(10); // Default 10km radius

  useEffect(() => {
    const fetchNearbyAgencies = async () => {
      if (!user?.agency?.location) {
        setError('Your agency location is not set. Please update your agency profile.');
        setLoading(false);
        return;
      }

      try {
        const response = await agencyAPI.getNearbyAgencies(searchRadius);
        setAgencies(response.agencies);
        setError(null);
      } catch (err) {
        setError('Failed to fetch nearby agencies. Please try again.');
        console.error('Error fetching nearby agencies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyAgencies();
  }, [user?.agency?.location, searchRadius]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // The useEffect will trigger with the new searchRadius
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Nearby Agencies</h1>
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="flex-1 max-w-xs">
              <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
                Search Radius (km)
              </label>
              <input
                type="number"
                id="radius"
                min="1"
                max="100"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Search
            </button>
          </form>
        </div>

        {agencies.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agencies found</h3>
            <p className="mt-1 text-sm text-gray-500">Try increasing the search radius.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencies.map((agency) => (
              <div key={agency._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{agency.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{agency.type}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{agency.distance?.toFixed(1)} km away</span>
                    </div>
                    {agency.contactPhone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{agency.contactPhone}</span>
                      </div>
                    )}
                    {agency.contactEmail && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{agency.contactEmail}</span>
                      </div>
                    )}
                  </div>

                  {agency.specialties && agency.specialties.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {agency.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyAgenciesPage; 