import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Clock, User } from 'lucide-react';
import { messageAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

const ConversationPage: React.FC = () => {
  const { agencyId } = useParams<{ agencyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipientAgency, setRecipientAgency] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (user && agencyId) {
          const userAgencyId = typeof user.agency === 'string' ? user.agency : user.agency._id;
          const response = await messageAPI.getConversation(userAgencyId, agencyId);
          setMessages(response);
          
          // Get recipient agency info from the first message
          if (response.length > 0) {
            const recipient = response[0].senderAgency._id === userAgencyId 
              ? response[0].recipient 
              : response[0].senderAgency;
            setRecipientAgency(recipient);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, agencyId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !agencyId) return;

    try {
      setSending(true);
      const userAgencyId = typeof user.agency === 'string' ? user.agency : user.agency._id;
      const response = await messageAPI.sendMessage({
        recipientAgencyId: agencyId,
        content: newMessage.trim()
      });
      
      setMessages(prev => [response, ...prev]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/messages')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {recipientAgency?.name || 'Agency'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {messages.length} messages in this conversation
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <Card className="h-[calc(100vh-16rem)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => {
              const isOwnMessage = typeof message.sender === 'string' 
                ? message.sender === user?._id
                : message.sender._id === user?._id;

              const showDate = index === 0 || 
                new Date(message.createdAt).toDateString() !== 
                new Date(messages[index - 1].createdAt).toDateString();

              return (
                <div key={message._id}>
                  {showDate && (
                    <div className="flex justify-center mb-6">
                      <Badge variant="secondary" size="sm">
                        <Clock size={12} className="mr-1" />
                        {new Date(message.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  )}
                  <div
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-start space-x-2 max-w-[70%]">
                      {!isOwnMessage && (
                        <div className="p-2 bg-primary-100 rounded-full">
                          <User size={16} className="text-primary-600" />
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-4 ${
                          isOwnMessage
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">
                            {typeof message.sender === 'string'
                              ? 'Unknown'
                              : `${message.sender.firstName} ${message.sender.lastName}`}
                          </span>
                          <span className="text-xs opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t bg-white p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={sending}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!newMessage.trim() || sending}
                className="min-w-[100px]"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Send
                  </>
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConversationPage;