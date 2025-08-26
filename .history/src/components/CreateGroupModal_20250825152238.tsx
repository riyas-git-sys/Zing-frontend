// src/components/CreateGroupModal.tsx
import { useState, useEffect } from 'react';
import { createGroupChat, searchUsers, getAllUsers } from '../services/chatService';
import type { User } from '@/types';

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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllUsers();
    }
  }, [isOpen]);

  const loadAllUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await getAllUsers();
      setAllUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      // Reset form
      setName('');
      setSelectedUsers([]);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  if (!isOpen) return null;

  const displayedUsers = searchQuery ? searchResults : allUsers;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Group</h2>
        
        <input
          type="text"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search users to add..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Selected Members */}
        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-gray-700">Selected Members:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm transition-all duration-200 hover:bg-blue-200"
                >
                  <span className="mr-2">{user.name}</span>
                  <button
                    onClick={() => toggleUserSelection(user)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Users List */}
        <div className="mb-4">
          <h3 className="font-medium mb-2 text-gray-700">
            {searchQuery ? 'Search Results' : 'All Users'}
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : displayedUsers.length > 0 ? (
              displayedUsers.map((user) => (
                <div
                  key={user._id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                    selectedUsers.some((u) => u._id === user._id)
                      ? 'bg-blue-50 border border-blue-200 shadow-md'
                      : 'bg-white border border-gray-200 hover:shadow-lg'
                  }`}
                  onClick={() => toggleUserSelection(user)}
                >
                  <div className="flex items-center">
                    <img
                      src={user.profilePicture || '/default-avatar.png'}
                      alt={user.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.mobile}</p>
                    </div>
                    {selectedUsers.some((u) => u._id === user._id) && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No users found</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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