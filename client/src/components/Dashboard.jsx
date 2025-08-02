import React from 'react';
import TaskCard from "../ui/card.jsx"; // Adjust path as needed
import Navbar from "../ui/Navbar.jsx"; // Adjust path as needed
import { useTaskContext } from "../context/TaskContext";

const Dashboard = ({ domainName = "example.com" }) => {
  const { selectedDomain, domainMap } = useTaskContext();

  console.log('Dashboard render - selectedDomain:', selectedDomain); // Debug log

  const sampleTasks = [
    {
      id: 1,
      title: "Complete project management project",
      description: "Create a basic and prototype for the project management application with task tracking and user management",
      taskMaker: "Subhadip",
      assignedTo: "xyz",
      createdAt: "2025-01-15T10:30:00Z",
      dueDate: "2025-01-22T17:00:00Z",
      domain: "WebD",
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
      domain: "WebD",
      status: "completed"
    },
    {
      id: 3,
      title: "Update homepage design",
      description: "Implement the new homepage layout with modern UI components",
      taskMaker: "Arpit",
      assignedTo: "xyz",
      createdAt: "2024-01-08T09:15:00Z",
      dueDate: "2024-01-12T16:30:00Z",
      domain: "Graphic Designing",
      status: "overdue"
    },
    {
      id: 4,
      title: "Create promotional video",
      description: "Edit and produce a 2-minute promotional video for the new product launch",
      taskMaker: "John",
      assignedTo: "Sarah",
      createdAt: "2025-01-20T11:00:00Z",
      dueDate: "2025-01-30T15:00:00Z",
      domain: "Video Editing",
      status: "pending"
    },
    {
      id: 5,
      title: "Write blog articles",
      description: "Create engaging blog content for the company website to improve SEO",
      taskMaker: "Emily",
      assignedTo: "Mike",
      createdAt: "2025-01-18T13:30:00Z",
      dueDate: "2025-01-25T17:00:00Z",
      domain: "Content Writing",
      status: "in-progress"
    },
    {
      id: 6,
      title: "Mobile app wireframes",
      description: "Design wireframes and user flow for the mobile application",
      taskMaker: "Alex",
      assignedTo: "Jordan",
      createdAt: "2025-01-12T10:00:00Z",
      dueDate: "2025-01-28T16:00:00Z",
      domain: "Graphic Designing",
      status: "pending"
    }
  ];

  const filteredTasks = selectedDomain === 'General'
      ? sampleTasks
      : sampleTasks.filter(task => task.domain === domainMap[selectedDomain]);

  console.log('Filtered tasks:', filteredTasks.length); // Debug log

  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-[1700px] mx-auto px-4 py-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              {selectedDomain === 'General' ? 'All Tasks' : `${selectedDomain} Tasks`}
            </h2>
            <p className="text-gray-500">
              Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                    <div key={task.id} className="h-96">
                      <TaskCard task={task} />
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No tasks found for {selectedDomain}
                  </p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Dashboard;