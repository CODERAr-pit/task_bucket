import { useState } from 'react'
import SignIn from './components/SignIn'
import Login from './components/Login'
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
    </div>
  )
}

export default App
