import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, UserPlus, Mail, Lock, User, Shield } from 'lucide-react';
import { userAPI, agencyAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Agency } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';

const roleOptions = [
  { value: 'user', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' }
];

const CreateUserPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'user',
    agencyId: typeof user?.agency === 'string' ? user.agency : user?.agency?._id || ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAgencies = async () => {
      if (user?.role === 'admin') {
        try {
          const response = await agencyAPI.getAllAgencies();
          setAgencies(response);
        } catch (error) {
          console.error('Error fetching agencies:', error);
        }
      }
    };

    fetchAgencies();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate required fields
    const requiredFields = ['email', 'password', 'firstName', 'lastName', 'role'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Check role permissions
    if (formData.role === 'admin' && user?.role !== 'admin') {
      setError('Only admin can create admin users');
      return;
    }
    
    try {
      setIsLoading(true);
      
      await userAPI.createUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        agencyId: formData.agencyId
      });
      
      navigate('/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const availableRoles = roleOptions.filter(role => {
    if (user?.role === 'admin') return true;
    return role.value !== 'admin';
  });

  const agencyOptions = agencies.map(agency => ({
    value: agency._id,
    label: agency.name
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-600">Add a new user to the system</p>
      </div>

      <Card>
        {error && (
          <Alert
            type="error"
            message={error}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="First Name"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              icon={<User size={16} />}
              required
            />
            
            <Input
              label="Last Name"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              icon={<User size={16} />}
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            icon={<Mail size={16} />}
            required
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock size={16} />}
              required
            />
            
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<Lock size={16} />}
              required
            />
          </div>

          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={(value) => handleChange({ target: { name: 'role', value: String(value) } } as any)}
            options={availableRoles}
            required
          />

          {user?.role === 'admin' && (
            <Select
              label="Agency"
              name="agencyId"
              value={typeof formData.agencyId === 'string' ? formData.agencyId : (formData.agencyId as any)?._id || ''}
              onChange={(value) => handleChange({ target: { name: 'agencyId', value: String(value) } } as any)}
              options={agencyOptions}
              required
            />
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Role Permissions</h3>
            <div className="text-sm text-gray-600">
              {formData.role === 'admin' && (
                <p>Admin: Full system access, can manage all agencies and users</p>
              )}
              {formData.role === 'manager' && (
                <p>Manager: Can manage agency inventory, users, send alerts, and approve borrows</p>
              )}
              {formData.role === 'user' && (
                <p>Staff: Can view inventory, send messages, and create borrow requests</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/users')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              icon={<UserPlus size={16} />}
            >
              Create User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateUserPage;