// // client/src/components/ContactsList.tsx
// import { useState, useEffect } from 'react';
// import { searchUsers, createChat, getChats, getAllUsers } from '../services/chatService';
// import { useAuth } from '../context/AuthContext';
// import type { User, Chat } from '../types';

// interface ContactsListProps {
//   onSelectChat: (chatId: string) => void;
// }

// function ContactsList({ onSelectChat }: ContactsListProps) {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState<User[]>([]);
//   const [contacts, setContacts] = useState<User[]>([]);
//   const [chats, setChats] = useState<Chat[]>([]);
//   const { user } = useAuth();
//   const [isMobile] = useState(window.innerWidth < 768);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     loadContacts();
//     loadChats();
//   }, [user]);

//   const loadContacts = async () => {
//     try {
//       setError('');
//       // Use the dedicated endpoint to get all users
//       const { data } = await getAllUsers();
//       setContacts(data.filter(u => u._id !== user?._id));
//     } catch (error: any) {
//       console.error('Error loading contacts:', error);
//       setError(error.response?.data?.message || 'Failed to load contacts');
      
//       // Fallback: If the /users endpoint doesn't exist, try search with common letters
//       if (error.response?.status === 404) {
//         console.log(' getAllUsers failed, trying search fallback');
//         const commonLetters = ['a', 'e', 'i', 'o', 'u'];
//         let contactsLoaded = false;
        
//         for (const letter of commonLetters) {
//           try {
//             const { data } = await searchUsers(letter);
//             setContacts(data.filter(u => u._id !== user?._id));
//             contactsLoaded = true;
//             break;
//           } catch (letterError: any) {
//             console.error(`Error loading contacts with letter ${letter}:`, letterError);
//             continue;
//           }
//         }
        
//         if (!contactsLoaded) {
//           setError('Failed to load contacts. Please try searching for specific users.');
//         }
//       }
//     }
//   };

//   const loadChats = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const { data } = await getChats();
//       setChats(data);
//     } catch (error: any) {
//       console.error('Error loading chats:', error);
//       setError(error.response?.data?.message || 'Failed to load chats');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = async (query: string) => {
//     setSearchQuery(query);
//     if (query.trim()) {
//       try {
//         setError('');
//         const { data } = await searchUsers(query);
//         setSearchResults(data.filter(u => u._id !== user?._id));
//       } catch (error: any) {
//         console.error('Error searching users:', error);
//         setError(error.response?.data?.message || 'Search failed');
//         setSearchResults([]);
//       }
//     } else {
//       setSearchResults([]);
//       setError('');
//     }
//   };

//   const handleStartChat = async (userId: string) => {
//     try {
//       setError('');
//       const { data } = await createChat(userId);
//       onSelectChat(data._id);
//     } catch (error: any) {
//       console.error('Error creating chat:', error);
//       setError(error.response?.data?.message || 'Failed to start chat');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="w-full md:w-1/3 bg-white border-r">
//         <div className="p-4 border-b">
//           <input
//             type="text"
//             placeholder="Search users..."
//             className="w-full p-2 border rounded"
//             disabled
//           />
//         </div>
//         <div className="flex items-center justify-center h-40">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-white border-r">
//       <div className="p-4 border-b">
//         <input
//           type="text"
//           placeholder="Search users..."
//           value={searchQuery || ''} // Add fallback to empty string
//           onChange={(e) => handleSearch(e.target.value)}
//           className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {error && (
//         <div className="p-3 bg-red-100 border-b border-red-200">
//           <p className="text-red-700 text-sm">{error}</p>
//           <button
//             onClick={() => {
//               loadContacts();
//               loadChats();
//             }}
//             className="text-blue-600 text-sm mt-1 hover:underline"
//           >
//             Try again
//           </button>
//         </div>
//       )}

//       <div className="overflow-y-auto h-full">
//         {searchQuery ? (
//           searchResults.length > 0 ? (
//             searchResults.map((user) => (
//               <div
//                 key={user._id}
//                 className="p-4 border-b hover:bg-gray-100 cursor-pointer transition-colors"
//                 onClick={() => handleStartChat(user._id)}
//               >
//                 <div className="flex items-center">
//                   <img
//                     src={user.profilePicture || '/default-avatar.png'}
//                     alt={user.name}
//                     className="w-10 h-10 rounded-full mr-3 object-cover"
//                   />
//                   <div>
//                     <p className="font-semibold text-gray-800">{user.name}</p>
//                     <p className="text-sm text-gray-500">{user.mobile}</p>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="p-4 text-center text-gray-500">
//               No users found
//             </div>
//           )
//         ) : (
//           <>
//             {/* Recent Chats Section */}
//             {chats.length > 0 && (
//               <div className="p-3 bg-gray-50 border-b">
//                 <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Recent Chats</h3>
//               </div>
//             )}
            
//             {chats.map((chat) => (
//               <div
//                 key={chat._id}
//                 className="p-4 border-b hover:bg-gray-100 cursor-pointer transition-colors"
//                 onClick={() => onSelectChat(chat._id)}
//               >
//                 <div className="flex items-center">
//                   <img
//                     src={chat.isGroup ? 
//                       (chat.picture || '/default-group.png') : 
//                       (chat.participants.find(p => p._id !== user?._id)?.profilePicture || '/default-avatar.png')
//                     }
//                     alt={chat.name || chat.participants.find(p => p._id !== user?._id)?.name}
//                     className="w-10 h-10 rounded-full mr-3 object-cover"
//                   />
//                   <div className="flex-1 min-w-0">
//                     <p className="font-semibold text-gray-800 truncate">
//                       {chat.isGroup ? 
//                         chat.name : 
//                         chat.participants.find(p => p._id !== user?._id)?.name
//                       }
//                     </p>
//                     {chat.lastMessage && (
//                       <p className="text-sm text-gray-500 truncate">
//                         {chat.lastMessage.content}
//                       </p>
//                     )}
//                   </div>
//                   {chat.lastMessage && (
//                     <span className="text-xs text-gray-400 whitespace-nowrap">
//                       {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { 
//                         hour: '2-digit', 
//                         minute: '2-digit' 
//                       })}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))}
            
//             {/* Contacts Section */}
//             {contacts.length > 0 && (
//               <div className="p-3 bg-gray-50 border-b">
//                 <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Contacts</h3>
//               </div>
//             )}
            
//             {contacts.map((contact) => (
//               <div
//                 key={contact._id}
//                 className="p-4 border-b hover:bg-gray-100 cursor-pointer transition-colors"
//                 onClick={() => handleStartChat(contact._id)}
//               >
//                 <div className="flex items-center">
//                   <img
//                     src={contact.profilePicture || '/default-avatar.png'}
//                     alt={contact.name}
//                     className="w-10 h-10 rounded-full mr-3 object-cover"
//                   />
//                   <div>
//                     <p className="font-semibold text-gray-800">{contact.name}</p>
//                     <p className="text-sm text-gray-500">{contact.mobile}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}

//             {chats.length === 0 && contacts.length === 0 && !error && (
//               <div className="p-4 text-center text-gray-500">
//                 No contacts or chats found
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ContactsList;