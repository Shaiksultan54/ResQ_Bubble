import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, MapPin, Phone, Mail } from 'lucide-react';
import { agencyAPI } from '../../lib/api';
import { Agency } from '../../types';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';

const agencyTypes = [
  { value: '', label: 'All Types' },
  { value: 'Fire Department', label: 'Fire Department' },
  { value: 'Hospital', label: 'Hospital' },
  { value: 'Police', label: 'Police' },
  { value: 'NGO', label: 'NGO' },
  { value: 'Government', label: 'Government' },
  { value: 'Military', label: 'Military' },
  { value: 'Other', label: 'Other' }
];

const AgenciesPage: React.FC = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await agencyAPI.getAllAgencies();
        setAgencies(response);
        setFilteredAgencies(response);
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  useEffect(() => {
    const filtered = agencies.filter(agency => {
      const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || agency.type === selectedType;
      return matchesSearch && matchesType;
    });
    setFilteredAgencies(filtered);
  }, [searchTerm, selectedType, agencies]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agencies</h1>
          <p className="text-gray-600">Browse and connect with other rescue agencies</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Input
          placeholder="Search agencies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={16} />}
        />
        <Select
          options={agencyTypes}
          value={selectedType}
          onChange={(value) => setSelectedType(value)}
          placeholder="Filter by type"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAgencies.map((agency) => (
          <Link
            key={agency._id}
            to={`/agencies/${agency._id}`}
            className="block hover:shadow-lg transition-shadow duration-200"
          >
            <Card>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-100 rounded-full">
                  <Users size={24} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-medium text-gray-900 truncate">
                    {agency.name}
                  </h2>
                  <Badge variant="primary" size="sm" className="mt-1">
                    {agency.type}
                  </Badge>
                  {agency.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {agency.description}
                    </p>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin size={16} className="mr-1" />
                      <span className="truncate">
                        {agency.address.city}, {agency.address.state}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone size={16} className="mr-1" />
                      <span className="truncate">{agency.contactPhone}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Mail size={16} className="mr-1" />
                    <span className="truncate">{agency.contactEmail}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredAgencies.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No agencies found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default AgenciesPage;