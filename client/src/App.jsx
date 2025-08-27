import SignUp from './components/SignIn'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import CreateTaskForm from './components/TaskForm'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import {TaskProvider} from "./context/TaskContext.jsx";

const DashboardWithProvider = () => (
    <ProtectedRoute>
      <TaskProvider>
        <Dashboard />
      </TaskProvider>
    </ProtectedRoute>
);

const TaskFormWithProvider = () => (
    <ProtectedRoute>
      <TaskProvider>
        <CreateTaskForm />
      </TaskProvider>
    </ProtectedRoute>
);

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
    element: <DashboardWithProvider />,
  },
  {
    path: "/dashboard/web-development",
    element: <DashboardWithProvider />,
  },
  {
    path: "/dashboard/content-writing",
    element: <DashboardWithProvider />,
  },
  {
    path: "/dashboard/graphic-designing",
    element: <DashboardWithProvider />,
  },
  {
    path: "/dashboard/video-editing",
    element: <DashboardWithProvider />,
  },
  {
    path: "/tasks",
    element: <TaskFormWithProvider />,
  },
]);

function App() {
  return <RouterProvider router={router} />
}

export default App;
