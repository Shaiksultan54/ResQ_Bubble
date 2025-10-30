import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Package,
  MessageSquare,
  AlertTriangle,
  Clock,
  Shield
} from 'lucide-react';
import { agencyAPI, inventoryAPI } from '../../lib/api';
import { Agency, InventoryItem } from '../../types';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const AgencyProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        if (id) {
          const [agencyData, inventoryData] = await Promise.all([
            agencyAPI.getAgencyById(id),
            inventoryAPI.getAgencyInventory(id)
          ]);
          setAgency(agencyData);
          setInventory(inventoryData);
        }
      } catch (err) {
        setError('Failed to load agency data');
        console.error('Error fetching agency data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencyData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert
          type="error"
          message={error || 'Agency not found'}
          icon={<AlertTriangle size={16} />}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{agency.name}</h1>
          <Badge
            variant={agency.active ? 'success' : 'error'}
            size="lg"
            rounded
          >
            {agency.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <p className="text-gray-600 mt-2">{agency.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Agency Information */}
        <div className="lg:col-span-1">
          <Card title="Agency Information">
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield size={20} className="text-primary-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Type</div>
                  <div className="text-gray-900">{agency.type}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Phone size={20} className="text-primary-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Contact Phone</div>
                  <div className="text-gray-900">{agency.contactPhone}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Mail size={20} className="text-primary-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Contact Email</div>
                  <div className="text-gray-900">{agency.contactEmail}</div>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin size={20} className="text-primary-600 mr-2 mt-1" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Address</div>
                  <div className="text-gray-900">
                    {agency.address.street}<br />
                    {agency.address.city}, {agency.address.state} {agency.address.zipCode}<br />
                    {agency.address.country}
                  </div>
                </div>
              </div>

              {agency.specialties && agency.specialties.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Specialties</div>
                  <div className="flex flex-wrap gap-2">
                    {agency.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="mt-6 space-y-4">
            <Link to={`/messages/${agency._id}`}>
              <Button
                variant="primary"
                className="w-full"
                icon={<MessageSquare size={16} />}
              >
                Send Message
              </Button>
            </Link>

            <Link to={`/alerts/new?agency=${agency._id}`}>
              <Button
                variant="warning"
                className="w-full"
                icon={<AlertTriangle size={16} />}
              >
                Send Alert
              </Button>
            </Link>
          </div>
        </div>

        {/* Available Resources */}
        <div className="lg:col-span-2">
          <Card
            title="Available Resources"
            subtitle="Resources that can be borrowed from this agency"
          >
            {inventory.length > 0 ? (
              <div className="space-y-4">
                {inventory.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-start p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="p-2 bg-primary-100 rounded-full">
                      <Package size={20} className="text-primary-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <Badge
                          variant={item.status === 'available' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="mr-4">
                          Quantity: {item.quantity} {item.unit}
                        </span>
                        {item.category && (
                          <Badge variant="secondary" size="sm">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      {item.status === 'available' && (
                        <div className="mt-4">
                          <Link to={`/borrow/new?item=${item._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Clock size={16} />}
                            >
                              Request to Borrow
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No resources available
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This agency hasn't added any resources yet
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgencyProfilePage;