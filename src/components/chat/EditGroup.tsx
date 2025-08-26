import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getChat, updateGroupInfo, uploadGroupPicture } from '../../services/chatService';
import defaultGroup from '../../assets/default-group.png';

function EditGroup() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState('');

  useEffect(() => {
    const loadGroupInfo = async () => {
      try {
        const { data: currentChat } = await getChat(chatId!);
        
        if (currentChat && currentChat.isGroup) {
          setGroup(currentChat);
          setFormData({
            name: currentChat.name,
            description: currentChat.description || '',
          });
          setPicturePreview(currentChat.picture || defaultGroup);
        }
      } catch (error) {
        console.error('Error loading group info:', error);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      loadGroupInfo();
    }
  }, [chatId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Update group info
      const { data: updatedGroup } = await updateGroupInfo(
        chatId!, 
        formData.name, 
        formData.description
      );
      
      // Upload picture if changed
      if (pictureFile) {
        const formData = new FormData();
        formData.append('picture', pictureFile);
        await uploadGroupPicture(chatId!, formData);
      }
      
      // Navigate back to group info
      navigate(`/chat/${chatId}/group-info`);
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Failed to update group information');
    } finally {
      setSaving(false);
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

  const isAdmin = group.admins?.some((admin: any) => admin._id === user?._id);
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Only admins can edit group information</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(`/chat/${chatId}/group-info`)}
            className="mr-3 text-blue-500 hover:text-blue-700 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Edit Group</h1>
        </div>
      </div>

      {/* Edit Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
          <div className="text-center mb-6">
            <label htmlFor="picture" className="cursor-pointer">
              <img
                src={picturePreview}
                alt={formData.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
              />
              <input
                type="file"
                id="picture"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />
              <span className="text-blue-500 text-sm hover:text-blue-700">
                Change Picture
              </span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter group description..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/chat/${chatId}/group-info`)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditGroup;