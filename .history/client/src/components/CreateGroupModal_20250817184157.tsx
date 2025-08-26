import { useState } from 'react';
import { createGroupChat, searchUsers } from '../services/chatService';
import { User } from '../services/chatService';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (groupId: string) => void;
}

function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const { data } = await searchUsers(query);
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreateGroup = async () => {
    if (!name.trim() || selectedUsers.length < 1) return;

    try {
      const { data } = await createGroupChat(
        name,
        selectedUsers.map((u) => u._id)
      );
      onGroupCreated(data._id);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
        
        <input
          type="text"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        
        <input
          type="text"
          placeholder="Search users to add"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        
        <div className="mb-4 max-h-40 overflow-y-auto">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className={`p-2 mb-2 rounded cursor-pointer ${
                selectedUsers.some((u) => u._id === user._id)
                  ? 'bg-blue-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleUserSelection(user)}
            >
              <div className="flex items-center">
                <img
                  src={user.profilePicture || '/default-avatar.png'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{user.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Selected Members:</h3>
          {selectedUsers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center bg-gray-200 rounded-full px-3 py-1"
                >
                  <span className="mr-2">{user.name}</span>
                  <button
                    onClick={() => toggleUserSelection(user)}
                    className="text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No users selected</p>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!name.trim() || selectedUsers.length < 1}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;