// client/src/components/chat/UserInfo.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getChats } from '../../services/chatService';
import defaultAvatar from '../../assets/default-avatar.png';

function UserInfo() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { data: chats } = await getChats();
        const currentChat = chats.find(chat => chat._id === chatId);
        
        if (currentChat && !currentChat.isGroup) {
          const otherParticipant = currentChat.participants.find(
            participant => participant._id !== user?._id
          );
          if (otherParticipant) {
            setOtherUser(otherParticipant);
          }
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [chatId, user?._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(`/chat/${chatId}`)}
            className="mr-3 text-blue-500 hover:text-blue-700 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">User Information</h1>
        </div>
      </div>

      {/* User Info Content */}
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
          <div className="text-center mb-6">
            <img
              src={otherUser.profilePicture || defaultAvatar}
              alt={otherUser.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
            />
            <h2 className="text-2xl font-bold text-gray-800">{otherUser.name}</h2>
            <p className="text-gray-600">+{otherUser.mobile}</p>
            {otherUser.status && (
              <p className="text-gray-500 mt-2">{otherUser.status}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Contact Information</h3>
              <p className="text-gray-600">Email: {otherUser.email}</p>
              <p className="text-gray-600">Phone: +{otherUser.mobile}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">About</h3>
              <p className="text-gray-600">
                {otherUser.status || 'No status available'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Account</h3>
              <p className="text-gray-600">
                Joined: {new Date(otherUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;