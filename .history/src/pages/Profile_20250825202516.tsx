// client/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import defaultAvatar from '../assets/default-avatar.png';

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Hey there! I\'m using ChatApp');
  const [profilePicture, setProfilePicture] = useState('');
  const [mobile, setMobile] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setStatus(user.status || 'Hey there! I\'m using ChatApp');
      setProfilePicture(user.profilePicture || '');
      setMobile(user.mobile);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('status', status);
      if (e.target.profilePicture.files[0]) {
        formData.append('profilePicture', e.target.profilePicture.files[0]);
      }

      const { data } = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the user context with ALL the returned data
      updateUser(data.user);
      
      setProfilePicture(data.user.profilePicture);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex flex-col items-center mb-6">
        <img
          src={profilePicture || defaultAvatar}
          alt={name}
          className="w-32 h-32 rounded-full mb-4 object-cover"
        />
        {isEditing ? (
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Status</label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter your status"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                name="profilePicture"
                accept="image/*"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-2xl font-semibold">{name}</h2>
            <p className="text-gray-600 mb-2">{mobile}</p>
            <p className="text-gray-700 mb-4">{status}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
            <button
              onClick={logout}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;