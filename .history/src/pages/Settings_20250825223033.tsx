// client/src/pages/Settings.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import LogoutModal from '@/components/LogoutModal';

function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme, notifications, setNotifications } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('account'); // Tab navigation
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    readReceipts: true,
    profileVisibility: 'contacts',
    lastSeen: 'everyone'
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Fetch user privacy settings
    const fetchPrivacySettings = async () => {
      try {
        const response = await api.get('/user/privacy-settings');
        if (response.data) {
          setPrivacySettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
      }
    };

    fetchPrivacySettings();
  }, []);

  // Handle logout confirmation
  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme as any);
    
    // Save to backend
    try {
      await api.post('/user/preferences', {
        theme: newTheme,
        notifications
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleNotificationsChange = async (newValue: boolean) => {
    setNotifications(newValue);
    
    // Save to backend
    try {
      await api.post('/user/preferences', {
        theme,
        notifications: newValue
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handlePrivacyChange = async (key: string, value: any) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    
    // Save to backend
    try {
      await api.post('/user/privacy-settings', newSettings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await api.delete('/auth/account', { data: { password } });
      
      // Successfully deleted account - manually handle logout
      localStorage.removeItem('chatToken');
      window.location.href = '/login';
      
    } catch (error: any) {
      console.error('Account deletion error:', error);
      
      // Handle 401 error specifically (invalid password)
      if (error.response?.status === 401) {
        setError('Invalid password. Please try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to delete account');
      }
    } finally {
      setIsDeleting(false);
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

  const closeModal = () => {
    setShowDeleteModal(false);
    setPassword('');
    setError('');
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
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl" style={{ marginBottom: '70px' }}>
          <div className="md:flex">
            {/* Sidebar/Navigation */}
            <div className="md:w-1/3 bg-gradient-to-b from-blue-500 to-blue-700 p-6 text-white">
              <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-semibold text-center mb-4">Settings</h2>
                <p className="text-blue-200 text-center">Manage your account preferences and security settings</p>
              </div>
              
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${activeTab === 'account' ? 'bg-white text-blue-700 font-medium' : 'hover:bg-blue-600'}`}
                >
                  Account Settings
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
                <button 
                  onClick={() => setActiveTab('danger')}
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${activeTab === 'danger' ? 'bg-white text-red-600 font-medium' : 'hover:bg-blue-600'}`}
                >
                  Danger Zone
                </button>
              </nav>
            </div>
            
            {/* Main Content Area */}
            <div className="md:w-2/3 p-8">
              {activeTab === 'account' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">+{user?.mobile}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Account Created</p>
                      <p className="font-medium">{new Date(user?.createdAt || '').toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium text-xs truncate">{user?._id}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Account Actions</h4>
                    <p className="text-blue-600 text-sm mb-3">Export your data or deactivate your account temporarily</p>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                        Export Data
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Deactivate Account
                      </button>
                    </div>
                  </div>
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
                      <h4 className="font-medium text-gray-700 mb-3">Language & Region</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>12-hour</option>
                            <option>24-hour</option>
                          </select>
                        </div>
                      </div>
                    </div>
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
                        
                        <div>
                          <p className="text-gray-600 mb-2">Last Seen & Online</p>
                          <div className="flex space-x-4">
                            <button 
                              onClick={() => handlePrivacyChange('lastSeen', 'everyone')}
                              className={`px-3 py-1 rounded-lg transition-all duration-200 ${privacySettings.lastSeen === 'everyone' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                            >
                              Everyone
                            </button>
                            <button 
                              onClick={() => handlePrivacyChange('lastSeen', 'contacts')}
                              className={`px-3 py-1 rounded-lg transition-all duration-200 ${privacySettings.lastSeen === 'contacts' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                            >
                              My Contacts
                            </button>
                            <button 
                              onClick={() => handlePrivacyChange('lastSeen', 'nobody')}
                              className={`px-3 py-1 rounded-lg transition-all duration-200 ${privacySettings.lastSeen === 'nobody' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
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
              
              {activeTab === 'danger' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Danger Zone</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                      <h4 className="font-medium text-red-700 mb-2">Logout</h4>
                      <p className="text-red-600 text-sm mb-4">Sign out of your account on this device.</p>
                      <button
                        onClick={handleLogoutClick}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                      <h4 className="font-medium text-red-700 mb-2">Delete Account</h4>
                      <p className="text-red-600 text-sm mb-4">
                        Permanently delete your account and all of your data. This action cannot be undone.
                      </p>
                      <button 
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-800 transition-colors"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Delete Account</h2>
            
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data will be permanently deleted.
              Please enter your password to confirm.
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                disabled={isDeleting}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || !password.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Confirm Deletion'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={handleLogoutConfirm}
      />
    </div>
  );
}

export default Settings;