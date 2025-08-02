import React from 'react'; 
import DomainButton from '../ui/button';  // 
import TaskCard from '../ui/card';   

const Dashboard = ({ domainName = "example.com" }) => {
  // Sample tasks data - we will replace this with our database data
  const sampleTasks = [
    {
      id: 1,
      title: "Complete project management project",
      description: "Create a basic and prototype for the project management application with task tracking and user management",
      taskMaker: "Subhadip",
      assignedTo: "xyz",
      createdAt: "2025-01-15T10:30:00Z",
      dueDate: "2025-01-22T17:00:00Z",
      priority: "high",
      status: "in-progress"
    },
    {
      id: 2,
      title: "Fix login bug",
      description: "Resolve the authentication issue where users can't log in with special characters in password",
      taskMaker: "Suyash",
      assignedTo: "xyz",
      createdAt: "2024-01-10T14:20:00Z",
      dueDate: "2024-01-18T12:00:00Z",
      priority: "medium",
      status: "completed"
    },
    {
      id: 3,
      title: "Update homepage design",
      description: "Implement the new homepage layout",
      taskMaker: "Arpit",
      assignedTo: "xyz",
      createdAt: "2024-01-08T09:15:00Z",
      dueDate: "2024-01-12T16:30:00Z",
      priority: "low",
      status: "overdue"
    },
    {
      id: 4,
      title: "Database optimization",
      description: "Optimize database queries for better performance",
      taskMaker: "John",
      assignedTo: "Sarah",
      createdAt: "2025-01-20T11:00:00Z",
      dueDate: "2025-01-30T15:00:00Z",
      priority: "medium",
      status: "pending"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Domain Button at the top */}
      <DomainButton domainName={domainName} />
      
      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Task Dashboard
        </h1>
        
        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sampleTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;