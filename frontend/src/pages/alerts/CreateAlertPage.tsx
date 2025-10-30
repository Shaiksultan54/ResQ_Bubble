import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import { alertAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import TextArea from '../../components/common/TextArea';

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

const severityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

const CreateAlertPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'medium' as AlertSeverity,
    coordinates: [0, 0] as [number, number],
    radius: 10,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate coordinates
      const [longitude, latitude] = formData.coordinates;
      if (isNaN(longitude) || isNaN(latitude)) {
        throw new Error('Please enter valid coordinates');
      }
      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }

      // Validate radius
      if (isNaN(formData.radius) || formData.radius <= 0) {
        throw new Error('Please enter a valid radius (must be greater than 0)');
      }

      // Format the data for the API
      const alertData = {
        ...formData,
        coordinates: formData.coordinates as [number, number],
        expiresAt: new Date(formData.expiresAt).toISOString()
      };

      await alertAPI.createAlert(alertData);
      navigate('/alerts');
    } catch (err: any) {
      setError(err.message || 'Failed to create alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoordinateChange = (index: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        coordinates: [
          index === 0 ? numValue : prev.coordinates[0],
          index === 1 ? numValue : prev.coordinates[1]
        ] as [number, number]
      }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Alert</h1>
        <p className="text-gray-600">Send an emergency alert to nearby agencies</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter alert title"
            />
          </div>

          <div>
            <TextArea
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Enter alert message"
              rows={4}
            />
          </div>

          <div>
            <Select
              label="Severity"
              name="severity"
              value={formData.severity}
              onChange={(value) => setFormData(prev => ({ ...prev, severity: value as AlertSeverity }))}
              options={severityOptions}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Input
                label="Longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.coordinates[0]}
                onChange={(e) => handleCoordinateChange(0, e.target.value)}
                required
                placeholder="Enter longitude (-180 to 180)"
                min="-180"
                max="180"
              />
            </div>
            <div>
              <Input
                label="Latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.coordinates[1]}
                onChange={(e) => handleCoordinateChange(1, e.target.value)}
                required
                placeholder="Enter latitude (-90 to 90)"
                min="-90"
                max="90"
              />
            </div>
          </div>

          <div>
            <Input
              label="Radius (kilometers)"
              name="radius"
              type="number"
              min="1"
              value={formData.radius}
              onChange={handleChange}
              required
              placeholder="Enter radius in kilometers"
            />
          </div>

          <div>
            <Input
              label="Expiration Date"
              name="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/alerts')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
            >
              Send Alert
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateAlertPage; 