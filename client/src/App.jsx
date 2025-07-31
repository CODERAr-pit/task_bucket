import { useState } from 'react'
import SignUp from './components/SignIn'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login') // Start with login page

  // Handle successful signup - go to login
  const handleSignUpSuccess = () => {
    setCurrentPage('login')
  }

  // Handle successful login - go to dashboard
  const handleLoginSuccess = () => {
    setCurrentPage('dashboard')
  }

  // Handle navigation from login to signup
  const handleGoToSignUp = () => {
    setCurrentPage('signup')
  }

  // Handle navigation from signup back to login
  const handleBackToLogin = () => {
    setCurrentPage('login')
  }

  // Handle logout from dashboard
  const handleLogout = () => {
    setCurrentPage('login')
  }

  // Get domain from user data for dashboard
  const getUserDomain = () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    return userData.domain || 'No Domain'
  }

  return (
    <div className="app bg-slate-800 min-h-screen">
      {currentPage === 'login' && (
        <Login 
          onBackToSignUp={handleGoToSignUp}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
      {currentPage === 'signup' && (
        <SignUp 
          onSignUpSuccess={handleSignUpSuccess}
          onBackToLogin={handleBackToLogin}
        />
      )}
      
      {currentPage === 'dashboard' && (
        <Dashboard 
          domainName={getUserDomain()}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default App;





{/*import { useState } from 'react'
import SignIn from './components/SignIn'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [isLoggedIn, setisLoggedIn] = useState(false)

  return (
    <div className="app bg-slate-900 min-h-screen">
      {isLoggedIn ? (
        <Login />
      ) : (
        <SignIn />
      )}
     <Dashboard domainName="example.com" />
    </div>
  )
}

export default App */}
