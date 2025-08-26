// client/src/components/ContactsList.tsx
import { useState, useEffect } from 'react';
import { searchUsers, createChat } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

interface ContactsListProps {
  onSelectChat: (chatId: string) => void;
}

function ContactsList({ onSelectChat }: ContactsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const { data } = await searchUsers('');
        setContacts(data.filter(u => u._id !== user?._id));
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    };

    loadContacts();
  }, [user]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const { data } = await searchUsers(query);
        setSearchResults(data.filter(u => u._id !== user?._id));
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleStartChat = async (userId: string) => {
    try {
      const { data } = await createChat(userId);
      onSelectChat(data._id);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div className="w-1/3 border-r">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="overflow-y-auto h-full">
        {searchQuery ? (
          searchResults.map((user) => (
            <div
              key={user._id}
              className="p-4 border-b hover:bg-gray-100 cursor-pointer"
              onClick={() => handleStartChat(user._id)}
            >
              <div className="flex items-center">
                <img
                  src={user.profilePicture || '/default-avatar.png'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.mobile}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          contacts.map((contact) => (
            <div
              key={contact._id}
              className="p-4 border-b hover:bg-gray-100 cursor-pointer"
              onClick={() => handleStartChat(contact._id)}
            >
              <div className="flex items-center">
                <img
                  src={contact.profilePicture || '/default-avatar.png'}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.mobile}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ContactsList;