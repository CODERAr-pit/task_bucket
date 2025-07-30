import { useState } from 'react'
import SignIn from './components/SignIn'
import Login from './components/Login'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('signin')

  const handleSignInSuccess = () => {
    setCurrentPage('login')
  }

  const handleBackToSignIn = () => {
    setCurrentPage('signin')
  }

  return (
    <div className="app bg-slate-800">
      {currentPage === 'signin' ? (
        <SignIn onSignInSuccess={handleSignInSuccess} />
      ) : (
        <Login onBackToSignIn={handleBackToSignIn} />
      )}
    </div>
  )
}

export default App
