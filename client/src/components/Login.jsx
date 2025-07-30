import { useState } from 'react';
import './Login.css';

const Login = ({ onBackToSignIn }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (loginData.email === userData.email && loginData.password === userData.password) {
      alert(`Welcome back, ${userData.name}!`);
    } else {
      alert('Invalid email or password!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={loginData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>
        
        <p className="back-link">
          Don't have an account? 
          <button onClick={onBackToSignIn} className="link-btn">Sign In</button>
        </p>
      </div>
    </div>
  );
};

export default Login;