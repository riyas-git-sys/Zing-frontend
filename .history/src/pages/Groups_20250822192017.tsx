// client/src/pages/Groups.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChats, createGroupChat } from '../services/chatService';
import CreateGroupModal from '../components/CreateGroupModal';
import type { Chat } from '@/types';

function Groups() {
  const [groups, setGroups] = useState<Chat[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create Group
        </button>
      </div>

      <div className="grid gap-4">
        {groups.map((group) => (
          <div
            key={group._id}
            onClick={() => navigate(`/chat/${group._id}`)}
            className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <img
                src={group.picture || '/default-group.png'}
                alt={group.name}
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <h3 className="font-semibold">{group.name}</h3>
                <p className="text-sm text-gray-600">
                  {group.participants.length} members
                </p>
                {group.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {group.lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No groups yet. Create your first group!</p>
        </div>
      )}

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}

export default Groups;