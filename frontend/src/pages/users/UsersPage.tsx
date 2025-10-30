import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Filter, Shield, UserCheck, UserX } from 'lucide-react';
import { userAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' }
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (user) {
          const agencyId = typeof user.agency === 'string' ? user.agency : user.agency._id;
          const response = await userAPI.getAgencyUsers(agencyId);
          setUsers(response);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, selectedRole, selectedStatus]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.loginId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'staff':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await userAPI.updateUserStatus(userId, { active: !currentStatus });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, active: !currentStatus } : u
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Manage all users' : 'Manage agency users'}
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Link to="/users/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Add User
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={16} />}
          className="md:col-span-2"
        />
        {user?.role === 'admin' && (
          <>
            <Select
              options={roleOptions}
              value={selectedRole}
              onChange={(value) => setSelectedRole(value)}
              placeholder="Filter by role"
              icon={<Filter size={16} />}
            />
            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value)}
              placeholder="Filter by status"
              icon={<Filter size={16} />}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((u) => (
          <Card key={u._id || u.id}>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary-100 rounded-full">
                <Users size={24} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 truncate">
                    {u.firstName} {u.lastName}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Badge
                      key={`role-${u._id || u.id}`}
                      variant={getRoleColor(u.role)}
                      size="sm"
                      rounded
                    >
                      {u.role}
                    </Badge>
                    <Badge
                      key={`status-${u._id || u.id}`}
                      variant={u.active ? 'success' : 'error'}
                      size="sm"
                      rounded
                    >
                      {u.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">{u.email}</p>
                  {u.loginId && (
                    <p className="text-sm text-gray-500">ID: {u.loginId}</p>
                  )}
                  {typeof u.agency === 'object' && (
                    <p className="text-sm text-gray-500">
                      Agency: {u.agency.name}
                    </p>
                  )}
                </div>

                {u.permissions && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">Permissions</div>
                    <div className="flex flex-wrap gap-1">
                      {u.permissions.canManageInventory && (
                        <Badge variant="info" size="sm">Inventory</Badge>
                      )}
                      {u.permissions.canManageUsers && (
                        <Badge variant="info" size="sm">Users</Badge>
                      )}
                      {u.permissions.canSendAlerts && (
                        <Badge variant="info" size="sm">Alerts</Badge>
                      )}
                      {u.permissions.canApproveBorrows && (
                        <Badge variant="info" size="sm">Borrows</Badge>
                      )}
                    </div>
                  </div>
                )}

                {(user?.role === 'admin' || (user?.role === 'manager' && user?.agency === u.agency)) && (
                  <div className="mt-4 flex space-x-2">
                    <Link to={`/users/${u.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    {u.role !== 'admin' && u.id !== user?.id && (
                      <Button
                        variant={u.active ? 'danger' : 'success'}
                        size="sm"
                        icon={u.active ? <UserX size={14} /> : <UserCheck size={14} />}
                        onClick={() => handleStatusToggle(u.id, u.active)}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedRole || selectedStatus
              ? 'Try adjusting your filters'
              : 'Get started by adding some users'}
          </p>
          {!searchTerm && !selectedRole && !selectedStatus && (user?.role === 'admin' || user?.role === 'manager') && (
            <div className="mt-6">
              <Link to="/users/new">
                <Button variant="primary" icon={<Plus size={16} />}>
                  Add First User
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersPage;