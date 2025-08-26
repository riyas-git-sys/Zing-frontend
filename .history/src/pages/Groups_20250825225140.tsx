// client/src/pages/Groups.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChats, createGroupChat, uploadGroupPicture, leaveGroup } from '../services/chatService';
import CreateGroupModal from '../components/CreateGroupModal';
import LeaveGroupModal from '../components/LeaveGroupModal';
import type { Chat } from '@/types';
import defaultGroupPicture from '../assets/default-group.png';

function Groups() {
  const [groups, setGroups] = useState<Chat[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Chat | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const { data } = await getChats();
      const groupChats = data.filter(chat => chat.isGroup);
      setGroups(groupChats);
    } catch (error) {
      console.error('Error loading groups:', error);
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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Group
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group._id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="p-4">
              <div className="flex items-center mb-4">
                <img
                  src={group.picture || defaultGroupPicture}
                  alt={group.name}
                  className="w-14 h-14 rounded-full mr-3 object-cover border-2 border-blue-100"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{group.name}</h3>
                  <p className="text-sm text-gray-600">
                    {group.participants.length} members
                  </p>
                  {isAdmin(group) && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              
              {group.lastMessage && (
                <p className="text-sm text-gray-500 mb-4 truncate">
                  {group.lastMessage.content}
                </p>
              )}
              
              <div className="flex gap-12">
                <button
                  onClick={() => navigate(`/chat/${group._id}`)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Open Chat
                </button>
                <button
                  onClick={() => openLeaveModal(group)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No groups yet. Create your first group!</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Group
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
  );
}

export default Groups;