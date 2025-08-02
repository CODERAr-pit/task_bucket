import { useState } from 'react'
import SignUp from './components/SignIn'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App;