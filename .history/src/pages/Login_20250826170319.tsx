import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png'; // Add this import

function Login() {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { emailOrMobile, password });
      await login(emailOrMobile, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle different error types
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const message = err.response.data?.message || 'Login failed';
        
        if (status === 401) {
          if (message === 'User Not Found') {
            setError('No account found with this email or mobile number');
          } else if (message === 'Invalid Password') {
            setError('Incorrect password. Please try again.');
          } else {
            setError('Invalid email/mobile or password');
          }
        } else if (status === 400) {
          setError('Invalid request. Please check your input.');
        } else if (status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(message);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other errors
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Validate input format
  const validateInput = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;
    
    if (!value) return 'Email or mobile number is required';
    if (!emailRegex.test(value) && !mobileRegex.test(value)) {
      return 'Please enter a valid email or 10-digit mobile number';
    }
    return null;
  };

  const inputError = validateInput(emailOrMobile);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <img 
            src={Logo} 
            alt="Zing Logo" 
            className="w-25 h-20 object-contain"
          />
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="p-3 text-red-700 bg-red-100 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="emailOrMobile" className="block text-sm font-medium text-gray-700">
              Email or Mobile Number
            </label>
            <input
              id="emailOrMobile"
              type="text"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none ${
                emailOrMobile && inputError 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }`}
              placeholder="Enter email or mobile number"
              required
            />
            {emailOrMobile && inputError && (
              <p className="text-sm text-red-500">{inputError}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm font-bold text-blue-500 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !!inputError}
            className={`w-full px-4 py-3 text-white text-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isLoading || inputError
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;