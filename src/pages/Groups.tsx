// client/src/pages/Groups.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChats, createGroupChat, uploadGroupPicture, leaveGroup } from '../services/chatService';
import CreateGroupModal from '../components/CreateGroupModal';
import LeaveGroupModal from '../components/LeaveGroupModal';
import defaultGroupIcon from '../assets/default-group.png'; // Import default group icon
import type { Chat } from '@/types';

function Groups() {
  const [groups, setGroups] = useState<Chat[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const { data } = await getChats();
      const groupChats = data.filter(chat => chat.isGroup);
      setGroups(groupChats);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupCreated = (groupId: string) => {
    loadGroups();
    navigate(`/chat/${groupId}`);
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;

    try {
      await leaveGroup(selectedGroup._id);
      setIsLeaveModalOpen(false);
      setSelectedGroup(null);
      loadGroups(); // Reload groups after leaving
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const openLeaveModal = (group: Chat) => {
    setSelectedGroup(group);
    setIsLeaveModalOpen(true);
  };

  const isAdmin = (group: Chat) => {
    return group.admin?._id === user?._id;
  };

  const getGroupInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLastMessagePreview = (group: Chat) => {
    if (!group.lastMessage) return null;
    
    const senderName = group.lastMessage.sender?._id === user?._id 
      ? 'You' 
      : group.lastMessage.sender?.name?.split(' ')[0] || 'Unknown';
    
    return {
      content: group.lastMessage.content,
      sender: senderName,
      time: new Date(group.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Groups</h1>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto" style={{marginBottom: '70px'}}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Groups</h1>
            <p className="text-gray-600 mt-2">Manage your group conversations</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Group
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const lastMessage = getLastMessagePreview(group);
            
            return (
              <div
                key={group._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/chat/${group._id}`)}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="relative">
                      {group.picture ? (
                        <img
                          src={group.picture}
                          alt={group.name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            // Fallback to default icon if image fails to load
                            e.currentTarget.src = defaultGroupIcon;
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-4 border-white shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {getGroupInitials(group.name)}
                          </span>
                        </div>
                      )}
                      {isAdmin(group) && (
                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-md">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{group.name}</h3>
                      <p className="text-sm text-gray-600">
                        {group.participants.length} {group.participants.length === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                  </div>
                  
                  {lastMessage && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 truncate">
                        <span className="font-medium text-gray-700">
                          {lastMessage.sender}: 
                        </span>
                        {' '}{lastMessage.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {lastMessage.time}
                      </p>
                    </div>
                  )}
                  
                  {!lastMessage && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 italic">
                        No messages yet
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chat/${group._id}`);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.5 8S2 16.418 2 12s4.418-8 9.5-8 9.5 3.582 9.5 8z" />
                      </svg>
                      Open Chat
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openLeaveModal(group);
                      }}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 hover:shadow-md flex items-center"
                      title="Leave Group"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No groups yet</h3>
              <p className="text-gray-500 mb-6">Create your first group to start chatting with multiple people!</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Create Your First Group
              </button>
            </div>
          </div>
        )}

        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onGroupCreated={handleGroupCreated}
        />

        <LeaveGroupModal
          isOpen={isLeaveModalOpen}
          onClose={() => {
            setIsLeaveModalOpen(false);
            setSelectedGroup(null);
          }}
          onConfirm={handleLeaveGroup}
          groupName={selectedGroup?.name || ''}
        />
      </div>
    </div>
  );
}

export default Groups;