import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { User, Lock, AlertTriangle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState({
    profile: false,
    password: false
  });
  
  const [error, setError] = useState({
    profile: '',
    password: ''
  });
  
  const [success, setSuccess] = useState({
    profile: false,
    password: false
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({ ...error, profile: '' });
    setSuccess({ ...success, profile: false });
    
    try {
      setLoading({ ...loading, profile: true });
      await updateProfile(profileData);
      setSuccess({ ...success, profile: true });
    } catch (err) {
      setError({
        ...error,
        profile: err instanceof Error ? err.message : 'Failed to update profile'
      });
    } finally {
      setLoading({ ...loading, profile: false });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({ ...error, password: '' });
    setSuccess({ ...success, password: false });
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError({ ...error, password: 'New passwords do not match' });
      return;
    }
    
    try {
      setLoading({ ...loading, password: true });
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess({ ...success, password: true });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError({
        ...error,
        password: err instanceof Error ? err.message : 'Failed to change password'
      });
    } finally {
      setLoading({ ...loading, password: false });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Profile Information */}
        <Card
          title="Profile Information"
          subtitle="Update your personal information"
        >
          {error.profile && (
            <Alert
              type="error"
              message={error.profile}
              icon={<AlertTriangle size={16} />}
              className="mb-4"
            />
          )}
          
          {success.profile && (
            <Alert
              type="success"
              message="Profile updated successfully"
              className="mb-4"
            />
          )}
          
          <form onSubmit={handleProfileUpdate}>
            <Input
              label="First Name"
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({
                ...profileData,
                firstName: e.target.value
              })}
              icon={<User size={16} />}
              required
            />
            
            <Input
              label="Last Name"
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({
                ...profileData,
                lastName: e.target.value
              })}
              icon={<User size={16} />}
              required
            />
            
            <Button
              type="submit"
              variant="primary"
              isLoading={loading.profile}
              className="mt-4"
            >
              Update Profile
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card
          title="Change Password"
          subtitle="Update your account password"
        >
          {error.password && (
            <Alert
              type="error"
              message={error.password}
              icon={<AlertTriangle size={16} />}
              className="mb-4"
            />
          )}
          
          {success.password && (
            <Alert
              type="success"
              message="Password changed successfully"
              className="mb-4"
            />
          )}
          
          <form onSubmit={handlePasswordChange}>
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({
                ...passwordData,
                currentPassword: e.target.value
              })}
              icon={<Lock size={16} />}
              required
            />
            
            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({
                ...passwordData,
                newPassword: e.target.value
              })}
              icon={<Lock size={16} />}
              required
            />
            
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value
              })}
              icon={<Lock size={16} />}
              required
            />
            
            <Button
              type="submit"
              variant="primary"
              isLoading={loading.password}
              className="mt-4"
            >
              Change Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;