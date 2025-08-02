import { useState } from 'react'
import SignUp from './components/SignIn'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'
// import { CreateTaskForm } from './components/TaskForm'

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

    </div>
  )
}

export default App;