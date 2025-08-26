// client/src/components/chat/ChatInfo.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChatMessages } from '../../services/chatService';

function ChatInfo() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('media');

  useEffect(() => {
    const loadChatInfo = async () => {
      try {
        const { data } = await getChatMessages(chatId!);
        setMessages(data);
      } catch (error) {
        console.error('Error loading chat info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChatInfo();
  }, [chatId]);

  const mediaMessages = messages.filter(msg => msg.media && msg.media.length > 0);
  const mediaFiles = mediaMessages.flatMap(msg => msg.media);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
          <h1 className="text-xl font-semibold text-gray-800">Chat Information</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-4 px-4 text-center ${
              activeTab === 'media'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Media & Files
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-4 px-4 text-center ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6" style={{marginBottom: '70px'}}>
        {activeTab === 'media' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Media, Files & Links ({mediaFiles.length})
            </h2>
            
            {mediaFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No media files shared yet
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={media.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs text-gray-600 truncate">{media.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(media.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Chat Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-700">Notifications</h3>
                  <p className="text-sm text-gray-500">Mute chat notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-700">Wallpaper</h3>
                  <p className="text-sm text-gray-500">Change chat background</p>
                </div>
                <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">
                  Change
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Chat History</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Total messages: {messages.length}
                </p>
                <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm">
                  Clear Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInfo;