backend/
├── package.json
├── .env
├── server.js                 # Main server file
├── models/
│   ├── User.js              # Senior/Junior users
│   ├── Task.js              # Task model
│   └── Domain.js            # Club domains (WebD, Graphics, etc.)
├── controllers/
│   ├── authController.js    # Login/Register
│   ├── taskController.js    # All task operations
│   └── userController.js    # User management
├── middleware/
│   ├── auth.js             # JWT authentication
│   └── roleCheck.js        # Senior/Junior access control
├── routes/
│   ├── authRoutes.js       # Auth routes
│   ├── taskRoutes.js       # Task routes
│   └── userRoutes.js       # User routes
└── config/
    └── database.js         # MongoDB connection

