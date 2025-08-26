// client/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import defaultAvatar from '../assets/default-avatar.png';

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme, notifications, setNotifications } = useTheme();
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Hey there! I\'m using ChatApp');
  const [profilePicture, setProfilePicture] = useState('');
  const [mobile, setMobile] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSeen, setLastSeen] = useState('everyone');
  const [activeTab, setActiveTab] = useState('profile');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    readReceipts: true,
    profileVisibility: 'contacts'
  });

  useEffect(() => {
    if (user) {
      console.log('User data in profile:', user);
      setName(user.name || '');
      setStatus(user.status || 'Hey there! I\'m using ChatApp');
      setProfilePicture(user.profilePicture || '');
      setMobile(user.mobile || '');
      setLastSeen(user.preferences?.lastSeen || 'everyone');
      
      // Set theme and notifications from ThemeContext
      if (user.preferences?.theme) {
        setTheme(user.preferences.theme);
      }
      if (user.preferences?.notifications !== undefined) {
        setNotifications(user.preferences.notifications);
      }
      
      // Set privacy settings
      if (user.preferences?.readReceipts !== undefined) {
        setPrivacySettings(prev => ({
          ...prev,
          readReceipts: user.preferences.readReceipts
        }));
      }
      if (user.preferences?.profileVisibility) {
        setPrivacySettings(prev => ({
          ...prev,
          profileVisibility: user.preferences.profileVisibility
        }));
      }
    }
  }, [user, setTheme, setNotifications]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('status', status);
      formData.append('preferences', JSON.stringify({
        theme,
        notifications,
        lastSeen,
        readReceipts: privacySettings.readReceipts,
        profileVisibility: privacySettings.profileVisibility
      }));
      
      if (e.target.profilePicture.files[0]) {
        formData.append('profilePicture', e.target.profilePicture.files[0]);
      }

      const { data } = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the user context with new data
      updateUser(data.user);
      
      setProfilePicture(data.user.profilePicture);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    
    // Save to backend
    try {
      await api.post('/user/preferences', {
        theme: newTheme,
        notifications,
        lastSeen,
        readReceipts: privacySettings.readReceipts,
        profileVisibility: privacySettings.profileVisibility
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleNotificationsChange = async (newValue) => {
    setNotifications(newValue);
    
    // Save to backend
    try {
      await api.post('/user/preferences', {
        theme,
        notifications: newValue,
        lastSeen,
        readReceipts: privacySettings.readReceipts,
        profileVisibility: privacySettings.profileVisibility
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handlePrivacyChange = async (key, value) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    
    // Save to backend
    try {
      await api.post('/user/preferences', {
        theme,
        notifications,
        lastSeen,
        readReceipts: newSettings.readReceipts,
        profileVisibility: newSettings.profileVisibility
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      if (twoFactorEnabled) {
        // Disable 2FA
        await api.post('/auth/disable-2fa');
        setTwoFactorEnabled(false);
        setBackupCodes([]);
        setShowBackupCodes(false);
      } else {
        // Enable 2FA
        const response = await api.post('/auth/enable-2fa');
        setBackupCodes(response.data.backupCodes);
        setShowBackupCodes(true);
        setTwoFactorEnabled(true);
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      alert('Failed to update two-factor authentication');
    }
  };

  const downloadBackupCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([backupCodes.join('\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "chatapp-backup-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="md:flex">
            {/* Sidebar/Navigation */}
            <div className="md:w-1/3 bg-gradient-to-b from-blue-500 to-blue-700 p-6 text-white">
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <img
                    src={profilePicture || defaultAvatar}
                    alt={name}
                    className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute bottom-4 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <h2 className="text-2xl font-semibold text-center">{name}</h2>
                <p className="text-blue-100 mb-2">+{mobile}</p>
                <p className="text-blue-200 text-center mb-4">{status}</p>
                <div className="bg-blue-400 bg-opacity-30 rounded-full px-4 py-1 text-sm">
                  Online
                </div>
              </div>
              
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${activeTab === 'profile' ? 'bg-white text-blue-700 font-medium' : 'hover:bg-blue-600'}`}
                >
                  Profile Information
                </button>
                <button 
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${activeTab === 'preferences' ? 'bg-white text-blue-700 font-medium' : 'hover:bg-blue-600'}`}
                >
                  Preferences
                </button>
                <button 
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${activeTab === 'privacy' ? 'bg-white text-blue-700 font-medium' : 'hover:bg-blue-600'}`}
                >
                  Privacy & Security
                </button>
              </nav>
              
              <button
                onClick={logout}
                className="mt-8 w-full py-3 bg-red-500 bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
            
            {/* Main Content Area */}
            <div className="p-8 pb-12 mb-12">
              {activeTab === 'profile' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h3>
                  
                  {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{name}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">+{mobile}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm md:col-span-2">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium">{status}</p>
                      </div>
                      <div className="md:col-span-2 flex justify-center mt-4">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={mobile}
                            disabled
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <input
                            type="text"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your status"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profile Picture
                          </label>
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <img
                                src={profilePicture || defaultAvatar}
                                alt={name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="file"
                                name="profilePicture"
                                accept="image/*"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                        >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
              
              {activeTab === 'preferences' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Preferences</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-3">Theme Preference</h4>
                      <div className="flex space-x-4">
                        <button 
                          onClick={() => handleThemeChange('light')}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${theme === 'light' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                        >
                          Light
                        </button>
                        <button 
                          onClick={() => handleThemeChange('dark')}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${theme === 'dark' ? 'bg-blue-900 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                        >
                          Dark
                        </button>
                        <button 
                          onClick={() => handleThemeChange('palenight')}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${theme === 'palenight' ? 'bg-purple-900 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                        >
                          Pale Night
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-3">Notifications</h4>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-gray-600">Enable notifications</p>
                          <p className="text-sm text-gray-500">Receive alerts for new messages</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={notifications}
                            onChange={(e) => handleNotificationsChange(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600">Sound alerts</p>
                          <p className="text-sm text-gray-500">Play sounds for new messages</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            defaultChecked
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-3">Last Seen Privacy</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input 
                            id="lastSeenEveryone" 
                            name="lastSeen" 
                            type="radio" 
                            checked={lastSeen === 'everyone'}
                            onChange={() => setLastSeen('everyone')}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-400"
                          />
                          <label htmlFor="lastSeenEveryone" className="ml-2 block text-sm text-gray-700">
                            Everyone
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            id="lastSeenContacts" 
                            name="lastSeen" 
                            type="radio" 
                            checked={lastSeen === 'contacts'}
                            onChange={() => setLastSeen('contacts')}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-400"
                          />
                          <label htmlFor="lastSeenContacts" className="ml-2 block text-sm text-gray-700">
                            My Contacts
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            id="lastSeenNobody" 
                            name="lastSeen" 
                            type="radio" 
                            checked={lastSeen === 'nobody'}
                            onChange={() => setLastSeen('nobody')}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-400"
                          />
                          <label htmlFor="lastSeenNobody" className="ml-2 block text-sm text-gray-700">
                            Nobody
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {isLoading ? 'Saving Preferences...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'privacy' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Privacy & Security</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-3">Two-Factor Authentication</h4>
                      <p className="text-gray-600 mb-4">Add an extra layer of security to your account by enabling two-factor authentication.</p>
                      
                      {showBackupCodes ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <h5 className="font-medium text-yellow-800 mb-2">Backup Codes</h5>
                          <p className="text-yellow-700 text-sm mb-3">
                            Save these codes in a secure place. Each code can be used only once.
                          </p>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {backupCodes.map((code, index) => (
                              <div key={index} className="bg-white p-2 rounded text-center font-mono text-sm">
                                {code}
                              </div>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={downloadBackupCodes}
                              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                            >
                              Download Codes
                            </button>
                            <button 
                              onClick={() => setShowBackupCodes(false)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                            >
                              I've Saved Them
                            </button>
                          </div>
                        </div>
                      ) : null}
                      
                      <div className="flex items-center justify-between">
                        <span>Two-Factor Authentication</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={handleTwoFactorToggle}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-3">Privacy Settings</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-600">Read Receipts</p>
                            <p className="text-sm text-gray-500">Let others see when you've read their messages</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacySettings.readReceipts}
                              onChange={(e) => handlePrivacyChange('readReceipts', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 mb-2">Profile Visibility</p>
                          <div className="flex space-x-4">
                            <button 
                              onClick={() => handlePrivacyChange('profileVisibility', 'everyone')}
                              className={`px-3 py-1 rounded-lg transition-all duration-200 ${privacySettings.profileVisibility === 'everyone' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                            >
                              Everyone
                            </button>
                            <button 
                              onClick={() => handlePrivacyChange('profileVisibility', 'contacts')}
                              className={`px-3 py-1 rounded-lg transition-all duration-200 ${privacySettings.profileVisibility === 'contacts' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                            >
                              My Contacts
                            </button>
                            <button 
                              onClick={() => handlePrivacyChange('profileVisibility', 'nobody')}
                              className={`px-3 py-1 rounded-lg transition-all duration-200 ${privacySettings.profileVisibility === 'nobody' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                            >
                              Nobody
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-3">Active Sessions</h4>
                      <p className="text-gray-600 mb-4">You're logged in on these devices. Log out of any unfamiliar sessions.</p>
                      <div className="border rounded-lg divide-y">
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">Chrome on Windows</p>
                              <p className="text-sm text-gray-500">Current session • Now</p>
                            </div>
                          </div>
                          <button className="text-red-500 hover:text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">Safari on iPhone</p>
                              <p className="text-sm text-gray-500">Yesterday at 14:30</p>
                            </div>
                          </div>
                          <button className="text-red-500 hover:text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;