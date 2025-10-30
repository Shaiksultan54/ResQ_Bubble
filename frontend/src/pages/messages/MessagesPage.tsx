import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Users, Plus, Filter } from 'lucide-react';
import { messageAPI, agencyAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Message, Agency } from '../../types';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const userAgencyId = typeof user.agency === 'string' ? user.agency : user.agency._id;
          const [messagesData, agenciesData] = await Promise.all([
            messageAPI.getAgencyMessages(userAgencyId),
            agencyAPI.getAllAgencies()
          ]);
          setMessages(messagesData);
          setAgencies(agenciesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredMessages = messages.filter(message => {
    const search = searchTerm.toLowerCase();
    
    // Get message content
    const content = message.content.toLowerCase();
    
    // Get sender information
    const senderName = typeof message.sender === 'string'
      ? message.sender
      : `${message.sender.firstName} ${message.sender.lastName}`.toLowerCase();
    
    // Get agency information
    const senderAgency = typeof message.senderAgency === 'string'
      ? agencies.find(a => a._id === message.senderAgency)?.name || ''
      : message.senderAgency.name;
    
    const recipientAgency = typeof message.recipient === 'string'
      ? agencies.find(a => a._id === message.recipient)?.name || ''
      : message.recipient.name;

    const matchesSearch = content.includes(search) ||
      senderName.includes(search) ||
      senderAgency.toLowerCase().includes(search) ||
      recipientAgency.toLowerCase().includes(search);

    const matchesUnread = !showUnreadOnly || !message.read;

    return matchesSearch && matchesUnread;
  });

  const groupedMessages = filteredMessages.reduce((groups, message) => {
    const agencyId = typeof message.senderAgency === 'string'
      ? message.senderAgency
      : message.senderAgency._id;
    
    if (!groups[agencyId]) {
      groups[agencyId] = [];
    }
    groups[agencyId].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  const agencyOptions = agencies
    .filter(agency => agency._id !== (typeof user?.agency === 'string' ? user.agency : user?.agency._id))
    .map(agency => ({
      value: agency._id,
      label: agency.name
    }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">Communicate with other agencies</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Select
                options={[
                  { value: '', label: 'Select an agency' },
                  ...agencyOptions
                ]}
                value={selectedAgency}
                onChange={(value) => {
                  if (value) {
                    navigate(`/messages/${value}`);
                  }
                }}
                label="Start new conversation"
                className="w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search messages, agencies, or senders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={16} />}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Show unread only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([agencyId, agencyMessages]) => {
            const latestMessage = agencyMessages[0];
            const agency = typeof latestMessage.senderAgency === 'string'
              ? agencies.find(a => a._id === agencyId) || { _id: agencyId, name: agencyId }
              : latestMessage.senderAgency;

            return (
              <Link
                key={agencyId}
                to={`/messages/${agencyId}`}
                className="block transform transition-all duration-200 hover:scale-[1.02]"
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <Users size={24} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">
                            {agency.name}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {typeof latestMessage.sender === 'string'
                              ? 'Unknown sender'
                              : `${latestMessage.sender.firstName} ${latestMessage.sender.lastName}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {agencyMessages.some(m => !m.read) && (
                            <Badge variant="primary" size="sm" rounded>
                              New
                            </Badge>
                          )}
                          <Badge variant="secondary" size="sm" rounded>
                            {agencyMessages.length}
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {latestMessage.content}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <MessageSquare size={14} className="mr-1" />
                        Last message:{' '}
                        {new Date(latestMessage.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}

          {filteredMessages.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No messages found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Start a conversation with another agency'}
              </p>
              {!searchTerm && (
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => document.querySelector('select')?.focus()}
                >
                  <Plus size={16} className="mr-2" />
                  Start New Conversation
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;