// client/src/components/chat/GroupInfo.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getChats } from '../../services/chatService';
import defaultGroup from '../../assets/default-group.png';
import defaultAvatar from '../../assets/default-avatar.png';

function GroupInfo() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroupInfo = async () => {
      try {
        const { data: chats } = await getChats();
        const currentChat = chats.find(chat => chat._id === chatId);
        if (currentChat && currentChat.isGroup) {
          setGroup(currentChat);
        }
      } catch (error) {
        console.error('Error loading group info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroupInfo();
  }, [chatId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Group not found</p>
      </div>
    );
  }

  const isAdmin = group.admin?._id === user?._id;

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
          <h1 className="text-xl font-semibold text-gray-800">Group Information</h1>
        </div>
      </div>

      {/* Group Info Content */}
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto" style={{marginBottom: '70px'}} >
          <div className="text-center mb-6">
            <img
              src={group.picture || defaultGroup}
              alt={group.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
            />
            <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
            <p className="text-gray-600">{group.participants.length} members</p>
            {isAdmin && (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full mt-2">
                Admin
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Group Description</h3>
              <p className="text-gray-600">
                {group.description || 'No description available'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Members ({group.participants.length})</h3>
              <div className="space-y-2">
                {group.participants.map((participant: any) => (
                  <div key={participant._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={participant.profilePicture || defaultAvatar}
                        alt={participant.name}
                        className="w-8 h-8 rounded-full mr-3 object-cover"
                      />
                      <span className="text-gray-700">{participant.name}</span>
                      {participant._id === group.admin?._id && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Group Settings</h3>
              <p className="text-gray-600">
                Created: {new Date(group.createdAt).toLocaleDateString()}
              </p>
              {isAdmin && (
                <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Edit Group
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupInfo;