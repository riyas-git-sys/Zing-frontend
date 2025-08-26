import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getChats, 
  promoteToAdmin, 
  demoteAdmin, 
  removeFromGroup, 
  leaveGroup, 
  deleteGroup, 
  addToGroup,
  searchUsers,
  getAllUsers
} from '../../services/chatService';
import defaultGroup from '../../assets/default-group.png';
import defaultAvatar from '../../assets/default-avatar.png';
import ConfirmationModal from '../ConfirmationModal';

// Icons
import { 
  FiArrowLeft, 
  FiShield, 
  FiUserPlus, 
  FiUserX, 
  FiEdit3, 
  FiLogOut, 
  FiTrash2,
  FiSearch,
  FiCrown,
  FiUsers,
  FiInfo,
  FiSettings,
  FiCheck,
  FiX
} from 'react-icons/fi';

function GroupInfo() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [promoteModal, setPromoteModal] = useState({ isOpen: false, user: null });
  const [demoteModal, setDemoteModal] = useState({ isOpen: false, user: null });
  const [removeModal, setRemoveModal] = useState({ isOpen: false, user: null });
  const [leaveModal, setLeaveModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addUserModal, setAddUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

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

    const loadAllUsers = async () => {
      try {
        const { data } = await getAllUsers();
        setAllUsers(data);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadGroupInfo();
    loadAllUsers();
  }, [chatId]);

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      const { data } = await promoteToAdmin(chatId!, userId);
      setGroup(data);
      setPromoteModal({ isOpen: false, user: null });
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Failed to promote user to admin');
    }
  };

  const handleDemoteAdmin = async (userId: string) => {
    try {
      const { data } = await demoteAdmin(chatId!, userId);
      setGroup(data);
      setDemoteModal({ isOpen: false, user: null });
    } catch (error) {
      console.error('Error demoting admin:', error);
      alert('Failed to demote admin');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const { data } = await removeFromGroup(chatId!, userId);
      setGroup(data);
      setRemoveModal({ isOpen: false, user: null });
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Failed to remove user from group');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(chatId!);
      setLeaveModal(false);
      navigate('/');
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group');
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup(chatId!);
      setDeleteModal(false);
      navigate('/');
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
    }
  };

  const handleAddUser = async (userId: string) => {
    try {
      const { data } = await addToGroup(chatId!, userId);
      setGroup(data);
      setAddUserModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user to group');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const { data } = await searchUsers(query);
        // Filter out users already in the group
        const filteredResults = data.filter(u => 
          !group.participants.some((p: any) => p._id === u._id) && 
          u._id !== user?._id
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Group not found</p>
      </div>
    );
  }

  const isAdmin = group.admins?.some((admin: any) => admin._id === user?._id);
  const isCurrentUserAdmin = isAdmin;
  const isCreator = group.creator?._id === user?._id;
  const canModify = isAdmin || isCreator;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(`/chat/${chatId}`)}
            className="mr-3 text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Group Information</h1>
        </div>
      </div>

      {/* Group Info Content */}
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto mb-16">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <img
                src={group.picture || defaultGroup}
                alt={group.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
              />
              {isAdmin && (
                <div className="absolute bottom-4 right-2 bg-yellow-100 text-yellow-800 p-1 rounded-full">
                  <FiShield className="w-4 h-4" />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{group.name}</h2>
            <div className="flex items-center justify-center text-gray-600">
              <FiUsers className="mr-1" />
              <span>{group.participants.length} members</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Group Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FiInfo className="text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-700">Group Description</h3>
              </div>
              <p className="text-gray-600 pl-6">
                {group.description || 'No description available'}
              </p>
            </div>

            {/* Members Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <FiUsers className="text-blue-500 mr-2" />
                  <h3 className="font-semibold text-gray-700">Members ({group.participants.length})</h3>
                </div>
                {isCurrentUserAdmin && (
                  <button
                    onClick={() => setAddUserModal(true)}
                    className="flex items-center text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <FiUserPlus className="mr-1" />
                    Add User
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {group.participants.map((participant: any) => (
                  <div key={participant._id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <img
                        src={participant.profilePicture || defaultAvatar}
                        alt={participant.name}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                      <div>
                        <div className="flex items-center">
                          <span className="text-gray-700 font-medium">{participant.name}</span>
                          {group.admins?.some((admin: any) => admin._id === participant._id) && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                              <FiShield className="w-3 h-3 mr-1" />
                              Admin
                            </span>
                          )}
                          {isCreator && participant._id === group.creator._id && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center">
                              <FiCrown className="w-3 h-3 mr-1" />
                              Creator
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{participant.email}</p>
                      </div>
                    </div>
                    
                    {canModify && participant._id !== user?._id && (
                      <div className="flex space-x-1">
                        {group.admins?.some((admin: any) => admin._id === participant._id) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDemoteModal({ isOpen: true, user: participant });
                            }}
                            className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                            title="Demote Admin"
                          >
                            <FiShield className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPromoteModal({ isOpen: true, user: participant });
                            }}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Make Admin"
                          >
                            <FiShield className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRemoveModal({ isOpen: true, user: participant });
                          }}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Remove User"
                        >
                          <FiUserX className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Group Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <FiSettings className="text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-700">Group Settings</h3>
              </div>
              <p className="text-gray-600 pl-6 text-sm mb-4">
                Created: {new Date(group.createdAt).toLocaleDateString()}
              </p>
              
              <div className="mt-4 space-y-2">
                {isCurrentUserAdmin && (
                  <button 
                    onClick={() => navigate(`/edit-group/${chatId}`)}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiEdit3 className="mr-2" />
                    Edit Group
                  </button>
                )}
                
                <button
                  onClick={() => setLeaveModal(true)}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <FiLogOut className="mr-2" />
                  Leave Group
                </button>

                {isCurrentUserAdmin && (
                  <button
                    onClick={() => setDeleteModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <FiTrash2 className="mr-2" />
                    Delete Group
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {addUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiUserPlus className="mr-2 text-blue-500" />
              Add User to Group
            </h2>
            
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <img
                          src={user.profilePicture || defaultAvatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddUser(user._id)}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Add to group"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  {searchQuery ? 'No users found' : 'Search for users to add to the group'}
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setAddUserModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={promoteModal.isOpen}
        onClose={() => setPromoteModal({ isOpen: false, user: null })}
        onConfirm={() => handlePromoteToAdmin(promoteModal.user?._id)}
        title="Promote to Admin"
        message={`Are you sure you want to make ${promoteModal.user?.name} an admin? They will have the same privileges as you.`}
        confirmText="Promote"
        cancelText="Cancel"
        icon={<FiShield className="w-6 h-6 text-blue-500" />}
      />

      <ConfirmationModal
        isOpen={demoteModal.isOpen}
        onClose={() => setDemoteModal({ isOpen: false, user: null })}
        onConfirm={() => handleDemoteAdmin(demoteModal.user?._id)}
        title="Demote Admin"
        message={`Are you sure you want to remove ${demoteModal.user?.name}'s admin privileges?`}
        confirmText="Demote"
        cancelText="Cancel"
        isDanger={true}
        icon={<FiShield className="w-6 h-6 text-yellow-500" />}
      />

      <ConfirmationModal
        isOpen={removeModal.isOpen}
        onClose={() => setRemoveModal({ isOpen: false, user: null })}
        onConfirm={() => handleRemoveUser(removeModal.user?._id)}
        title="Remove User"
        message={`Are you sure you want to remove ${removeModal.user?.name} from this group?`}
        confirmText="Remove"
        cancelText="Cancel"
        isDanger={true}
        icon={<FiUserX className="w-6 h-6 text-red-500" />}
      />

      <ConfirmationModal
        isOpen={leaveModal}
        onClose={() => setLeaveModal(false)}
        onConfirm={handleLeaveGroup}
        title="Leave Group"
        message={`Are you sure you want to leave "${group.name}"?${isCurrentUserAdmin ? ' As admin, you will need to assign a new admin before leaving.' : ''}`}
        confirmText="Leave Group"
        cancelText="Cancel"
        isDanger={true}
        icon={<FiLogOut className="w-6 h-6 text-red-500" />}
      />

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteGroup}
        title="Delete Group"
        message={`Are you sure you want to delete "${group.name}"? This action cannot be undone and all messages will be lost.`}
        confirmText="Delete Group"
        cancelText="Cancel"
        isDanger={true}
        icon={<FiTrash2 className="w-6 h-6 text-red-500" />}
      />
    </div>
  );
}

export default GroupInfo;