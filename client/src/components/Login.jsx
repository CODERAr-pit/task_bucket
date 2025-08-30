import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import TaskNotificationPopup from './TaskNotificationPopup';

const Login = ({ onBackToSignUp }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const res = await fetch(`${apiUrl}/api/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    email: loginData.email,
    password: loginData.password
  })
});

   if (res.ok) {
  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('userData', JSON.stringify(data.user));

  console.log('Login successful:', data);
  
  // Show notification popup for regular users, redirect admins immediately
  if (data.user.isAdmin) {
    navigate('/admin');
  } else {
    setCurrentUser(data.user);
    setShowNotifications(true);
    // Navigate after a delay to allow notification popup to show
    setTimeout(() => {
      if (!showNotifications) {
        navigate('/dashboard');
      }
    }, 1000);
  }

} else {
  const error = await res.json();
  alert(error.message || 'Invalid email or password!');
}
  };

  const handleNotificationClose = () => {
    setShowNotifications(false);
    navigate('/dashboard');
  };

  return (
      <div className="min-h-screen bg-[#00043C] flex items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white p-10 rounded-xl shadow-xl border border-white/80">
            <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
              Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleChange}
                    required
                    className="w-full sm:w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    required
                    className="w-full sm:w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 transition"
              >
                Login
              </button>
            </form>

            <div className='flex items-center justify-center mt-6'>
              <p className="text-center text-gray-600">
              Don't have an account?

            </p>

            <Link
                to="/signup"
                className="text-slate-800 hover:text-slate-900 font-semibold"
                onClick={onBackToSignUp}
            >
              <button
                  onClick={onBackToSignUp}
                  className="text-blue-600 hover:text-blue-800 underline ml-2"
                  type="button"
              >
                Sign In
              </button>
            </Link>
            </div>
          </div>
        </div>
        
        {/* Task Notification Popup */}
        {showNotifications && currentUser && (
          <TaskNotificationPopup 
            user={currentUser} 
            onClose={handleNotificationClose}
          />
        )}
      </div>
  );
};

export default Login;
