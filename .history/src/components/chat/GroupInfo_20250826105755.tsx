import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getChats, promoteToAdmin, removeFromGroup, leaveGroup } from '../../services/chatService';
import defaultGroup from '../../assets/default-group.png';
import defaultAvatar from '../../assets/default-avatar.png';
import ConfirmationModal from '../ConfirmationModal';

function GroupInfo() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [promoteModal, setPromoteModal] = useState({ isOpen: false, user: null });
  const [removeModal, setRemoveModal] = useState({ isOpen: false, user: null });
  const [leaveModal, setLeaveModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

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
      navigate('/'); // Redirect to home after leaving
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group');
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup(chatId!);
      setDeleteModal(false);
      navigate('/'); // Redirect to home after deletion
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
    }
  };

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
  const isCurrentUserAdmin = isAdmin;

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
                    
                    {isCurrentUserAdmin && participant._id !== user?._id && (
                      <div className="flex space-x-2">
                        {participant._id !== group.admin?._id && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPromoteModal({ isOpen: true, user: participant });
                              }}
                              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                              title="Make Admin"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRemoveModal({ isOpen: true, user: participant });
                              }}
                              className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                              title="Remove User"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 极速赛车开奖结果 极速赛车开奖记录 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Group Settings</h3>
              <p className="text-gray-600">
                Created: {new Date(group.createdAt).toLocaleDateString()}
              </p>
              
              <div className="mt-4 space-y-2">
                {isCurrentUserAdmin && (
                  <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Edit Group
                  </button>
                )}
                
                <button
                  onClick={() => setLeaveModal(true)}
                  className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Leave Group
                </button>
              </div>
            </div>
            {isCurrentUserAdmin && (
              <>
                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-2">
                  Edit Group
                </button>
                <button
                  onClick={() => setDeleteModal(true)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete Group
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Promote to Admin Confirmation Modal */}
      <ConfirmationModal
        isOpen={promoteModal.isOpen}
        onClose={() => setPromoteModal({ isOpen: false, user: null })}
        onConfirm={() => handlePromoteToAdmin(promoteModal.user?._id)}
        title="Promote to Admin"
        message={`Are you sure you want to make ${promoteModal.user?.name} an admin? They will have the same privileges as you.`}
        confirmText="Promote"
        cancelText="Cancel"
      />

      {/* Remove User Confirmation Modal */}
      <ConfirmationModal
        isOpen={removeModal.isOpen}
        onClose={() => setRemoveModal({ isOpen: false, user: null })}
        onConfirm={() => handleRemoveUser(removeModal.user?._id)}
        title="Remove User"
        message={`Are you sure you want to remove ${removeModal.user?.name} from this group?`}
        confirmText="Remove"
        cancelText="Cancel"
        isDanger={true}
      />

      {/* Leave Group Confirmation Modal */}
      <ConfirmationModal
        isOpen={leaveModal}
        onClose={() => setLeaveModal(false)}
        onConfirm={handleLeaveGroup}
        title="Leave Group"
        message={`Are you sure you want to leave "${group.name}"?${isCurrentUserAdmin ? ' As admin, you will need to assign a new admin before leaving.' : ''}`}
        confirmText="Leave Group"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
}

export default GroupInfo;