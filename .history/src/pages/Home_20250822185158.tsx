import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to ChatApp</h1>
        <p className="text-gray-600 mb-4">
          Hello, {user?.name}! You are successfully logged in.
        </p>
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold mb-2">User Info:</h2>
          <p>Email: {user?.email}</p>
          <p>Mobile: {user?.mobile}</p>
        </div>
        <button 
          onClick={() => console.log('User:', user)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Log User Info to Console
        </button>
      </div>
    </div>
  );
}

export default Home;