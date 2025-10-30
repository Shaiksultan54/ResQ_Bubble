import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, UserPlus, Mail, Lock, Building, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Select from '../../components/common/Select';

const agencyTypes = [
  { value: 'Fire Department', label: 'Fire Department' },
  { value: 'Hospital', label: 'Hospital' },
  { value: 'Police', label: 'Police' },
  { value: 'NGO', label: 'NGO' },
  { value: 'Government', label: 'Government' },
  { value: 'Military', label: 'Military' },
  { value: 'Other', label: 'Other' }
];

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agencyName: '',
    agencyType: '',
    contactPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: string[] = [];

    // Password validation
    if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(formData.password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(formData.password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(formData.password)) {
      errors.push('Password must contain at least one number');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(formData.contactPhone)) {
      errors.push('Please enter a valid phone number (minimum 10 digits)');
    }

    // Required fields validation
    const requiredFields = [
      { field: 'email', label: 'Email' },
      { field: 'password', label: 'Password' },
      { field: 'confirmPassword', label: 'Confirm Password' },
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'agencyName', label: 'Agency Name' },
      { field: 'agencyType', label: 'Agency Type' },
      { field: 'contactPhone', label: 'Contact Phone' }
    ];
    
    const missingFields = requiredFields.filter(({ field }) => !formData[field as keyof typeof formData]);
    if (missingFields.length > 0) {
      errors.push(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    // Agency name validation
    if (formData.agencyName && formData.agencyName.length < 3) {
      errors.push('Agency name must be at least 3 characters long');
    }

    // Name validation
    if (formData.firstName && formData.firstName.length < 2) {
      errors.push('First name must be at least 2 characters long');
    }
    if (formData.lastName && formData.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }

    return errors.length > 0 ? errors.join('. ') : null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    let coordinates: [number, number] | undefined = undefined;
    try {
      // Build address string for geocoding
      const addressString = `${formData.address.street}, ${formData.address.city}, ${formData.address.state}, ${formData.address.zipCode}, ${formData.address.country}`;
      try {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`;
        const geocodeResponse = await fetch(geocodeUrl, {
          headers: {
            'User-Agent': 'EmergencyResourceApp/1.0'
          }
        });
        const geocodeData = await geocodeResponse.json();
        if (geocodeData && geocodeData.length > 0) {
          coordinates = [parseFloat(geocodeData[0].lon), parseFloat(geocodeData[0].lat)];
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
      }
      // If geocoding failed, use default coordinates (Hyderabad)
      if (!coordinates) {
        coordinates = [78.4867, 17.3850];
      }
      // Format registration data according to backend requirements
      const registrationData = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        agency: {
          name: formData.agencyName.trim(),
          type: formData.agencyType,
          contactPhone: formData.contactPhone.trim(),
          contactEmail: formData.email.trim(),
          address: {
            street: formData.address.street.trim(),
            city: formData.address.city.trim(),
            state: formData.address.state.trim(),
            zipCode: formData.address.zipCode.trim(),
            country: formData.address.country.trim()
          },
          location: {
            type: 'Point',
            coordinates: coordinates
          }
        }
      };

      // Validate coordinates
      const [longitude, latitude] = registrationData.agency.location.coordinates;
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        throw new Error('Invalid coordinates. Longitude must be between -180 and 180, and latitude must be between -90 and 90.');
      }

      // Validate required fields
      const requiredFields = ['email', 'password', 'firstName', 'lastName'];
      const missingFields = requiredFields.filter(field => !registrationData[field as keyof typeof registrationData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const requiredAgencyFields = ['name', 'type', 'contactPhone'];
      const missingAgencyFields = requiredAgencyFields.filter(field => !registrationData.agency[field as keyof typeof registrationData.agency]);
      
      if (missingAgencyFields.length > 0) {
        throw new Error(`Missing required agency fields: ${missingAgencyFields.join(', ')}`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registrationData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password format
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(registrationData.password)) {
        throw new Error('Password must be at least 8 characters long and contain at least one number, one uppercase letter, and one lowercase letter');
      }

      // Validate phone format
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(registrationData.agency.contactPhone)) {
        throw new Error('Please enter a valid phone number (minimum 10 digits)');
      }

      // Log the registration data for debugging
      console.log('Registration attempt with data:', {
        email: registrationData.email,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        agencyName: registrationData.agency.name,
        agencyType: registrationData.agency.type,
        contactPhone: registrationData.agency.contactPhone,
        hasLocation: !!registrationData.agency.location.coordinates,
        coordinates: registrationData.agency.location.coordinates
      });
      
      await register(registrationData);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Handle specific error cases
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setError(Array.isArray(err.response.data.errors) 
          ? err.response.data.errors.join('. ')
          : err.response.data.errors);
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register your agency
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl ring-1 ring-gray-900/5">
          {error && (
            <Alert
              type="error"
              message={error}
              className="mb-6 animate-fade-in"
            />
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
              
              <Input
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail size={16} />}
                required
                placeholder="Enter your email"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
              
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock size={16} />}
                required
                placeholder="Enter your password"
                minLength={8}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
              
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={<Lock size={16} />}
                required
                placeholder="Confirm your password"
                minLength={8}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              
              <Input
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                icon={<UserPlus size={16} />}
                required
                placeholder="Enter your first name"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
              
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                icon={<UserPlus size={16} />}
                required
                placeholder="Enter your last name"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Agency Information</h3>
              
              <Input
                label="Agency Name"
                type="text"
                name="agencyName"
                value={formData.agencyName}
                onChange={handleChange}
                icon={<Building size={16} />}
                required
                placeholder="Enter agency name"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
              
              <Select
                label="Agency Type"
                name="agencyType"
                value={formData.agencyType}
                onChange={(value) => handleChange({ target: { name: 'agencyType', value } } as any)}
                options={agencyTypes}
                required
                placeholder="Select agency type"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
              
              <Input
                label="Contact Phone"
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                icon={<Phone size={16} />}
                required
                placeholder="Enter contact phone number"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Location Information</h3>
              <Input
                label="Street"
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                icon={<MapPin size={16} />}
                required
                placeholder="Enter street address"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
              <Input
                label="City"
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                icon={<MapPin size={16} />}
                required
                placeholder="Enter city"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
              <Input
                label="State"
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                icon={<MapPin size={16} />}
                required
                placeholder="Enter state"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
              <Input
                label="Zip Code"
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                icon={<MapPin size={16} />}
                required
                placeholder="Enter zip code"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
              <Input
                label="Country"
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                icon={<MapPin size={16} />}
                required
                placeholder="Enter country"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full group"
            >
              Register
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;