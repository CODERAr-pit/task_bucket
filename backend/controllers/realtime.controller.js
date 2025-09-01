import { Task } from "../models/Task.js";
import { User } from "../models/User.js";

// Subscribe to realtime task changes via SSE
const subscribeToTaskChanges = async (req, res) => {
    try {
        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
            'Access-Control-Allow-Credentials': 'true'
        });

        const userDomain = req.user.domain;
        const userDomains = req.user.domains || [userDomain].filter(Boolean);
        const userId = req.user._id.toString();

        // Send initial connection message
        res.write(`data: ${JSON.stringify({ 
            type: 'connected', 
            message: 'Connected to task updates',
            timestamp: new Date().toISOString()
        })}\n\n`);

        // Set up change stream for tasks in user's domains
        const changeStream = Task.watch([
            {
                $match: {
                    'fullDocument.domain': { $in: userDomains }
                }
            }
        ], { fullDocument: 'updateLookup' });

        // Handle change events
        changeStream.on('change', async (change) => {
            try {
                let eventData = {
                    type: change.operationType,
                    timestamp: new Date().toISOString()
                };

                switch (change.operationType) {
                    case 'insert':
                        // New task created
                        const newTask = change.fullDocument;
                        eventData.data = await populateTaskData(newTask);
                        eventData.message = `New task created: ${newTask.title}`;
                        break;

                    case 'update':
                        // Task updated
                        const updatedTask = change.fullDocument;
                        if (updatedTask) {
                            eventData.data = await populateTaskData(updatedTask);
                            eventData.message = `Task updated: ${updatedTask.title}`;
                            eventData.updatedFields = change.updateDescription?.updatedFields || {};
                        }
                        break;

                    case 'delete':
                        // Task deleted
                        eventData.data = { _id: change.documentKey._id };
                        eventData.message = 'Task deleted';
                        break;

                    case 'replace':
                        // Task replaced
                        const replacedTask = change.fullDocument;
                        if (replacedTask) {
                            eventData.data = await populateTaskData(replacedTask);
                            eventData.message = `Task replaced: ${replacedTask.title}`;
                        }
                        break;
                }

                // Send the change event to client
                res.write(`data: ${JSON.stringify(eventData)}\n\n`);

            } catch (error) {
                console.error('Error processing change event:', error);
                res.write(`data: ${JSON.stringify({
                    type: 'error',
                    message: 'Error processing change',
                    timestamp: new Date().toISOString()
                })}\n\n`);
            }
        });

        changeStream.on('error', (error) => {
            console.error('Change stream error:', error);
            res.write(`data: ${JSON.stringify({
                type: 'error',
                message: 'Connection error',
                timestamp: new Date().toISOString()
            })}\n\n`);
        });

        // Send periodic heartbeat
        const heartbeatInterval = setInterval(() => {
            res.write(`data: ${JSON.stringify({
                type: 'heartbeat',
                timestamp: new Date().toISOString()
            })}\n\n`);
        }, 30000); // Every 30 seconds

        // Clean up on client disconnect
        req.on('close', () => {
            console.log('SSE client disconnected');
            clearInterval(heartbeatInterval);
            if (changeStream) {
                changeStream.close();
            }
        });

    } catch (error) {
        console.error('Error in subscribeToTaskChanges:', error);
        res.status(500).json({
            error: 'Failed to subscribe to task changes',
            details: error.message
        });
    }
};

// Subscribe to specific task changes
const subscribeToTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate task ID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: 'Invalid task ID format'
            });
        }

        // Check if task exists and user has access
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        const userDomain = req.user.domain;
        const userDomains = req.user.domains || [userDomain].filter(Boolean);
        if (!userDomains.includes(task.domain)) {
            return res.status(403).json({
                error: 'You can only subscribe to tasks in your domains'
            });
        }

        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
            'Access-Control-Allow-Credentials': 'true'
        });

        // Send initial task data
        const initialData = await populateTaskData(task);
        res.write(`data: ${JSON.stringify({
            type: 'initial',
            data: initialData,
            message: `Subscribed to task: ${task.title}`,
            timestamp: new Date().toISOString()
        })}\n\n`);

        // Set up change stream for specific task
        const changeStream = Task.watch([
            {
                $match: {
                    'documentKey._id': task._id
                }
            }
        ], { fullDocument: 'updateLookup' });

        // Handle change events for specific task
        changeStream.on('change', async (change) => {
            try {
                let eventData = {
                    type: change.operationType,
                    timestamp: new Date().toISOString()
                };

                switch (change.operationType) {
                    case 'update':
                        const updatedTask = change.fullDocument;
                        if (updatedTask) {
                            eventData.data = await populateTaskData(updatedTask);
                            eventData.message = `Task updated: ${updatedTask.title}`;
                            eventData.updatedFields = change.updateDescription?.updatedFields || {};
                        }
                        break;

                    case 'delete':
                        eventData.data = { _id: change.documentKey._id };
                        eventData.message = 'Task deleted';
                        break;

                    case 'replace':
                        const replacedTask = change.fullDocument;
                        if (replacedTask) {
                            eventData.data = await populateTaskData(replacedTask);
                            eventData.message = `Task replaced: ${replacedTask.title}`;
                        }
                        break;
                }

                res.write(`data: ${JSON.stringify(eventData)}\n\n`);

            } catch (error) {
                console.error('Error processing task change event:', error);
                res.write(`data: ${JSON.stringify({
                    type: 'error',
                    message: 'Error processing change',
                    timestamp: new Date().toISOString()
                })}\n\n`);
            }
        });

        changeStream.on('error', (error) => {
            console.error('Task change stream error:', error);
            res.write(`data: ${JSON.stringify({
                type: 'error',
                message: 'Connection error',
                timestamp: new Date().toISOString()
            })}\n\n`);
        });

        // Clean up on client disconnect
        req.on('close', () => {
            console.log('SSE task client disconnected');
            if (changeStream) {
                changeStream.close();
            }
        });

    } catch (error) {
        console.error('Error in subscribeToTaskById:', error);
        res.status(500).json({
            error: 'Failed to subscribe to task changes',
            details: error.message
        });
    }
};

// Helper function to populate task data with user information
const populateTaskData = async (task) => {
    try {
        const populatedTask = await Task.findById(task._id)
            .populate('taskMaker', 'name email role')
            .populate('assignedTo', 'name email role')
            .lean();
        
        return populatedTask || task;
    } catch (error) {
        console.error('Error populating task data:', error);
        return task;
    }
};

// Get SSE connection status/info
const getSSEInfo = (req, res) => {
    res.status(200).json({
        message: 'Server-Sent Events endpoint for real-time task updates',
        endpoints: {
            '/api/tasks/realtime': 'Subscribe to all task changes in your domain',
            '/api/tasks/realtime/:id': 'Subscribe to specific task changes'
        },
        usage: {
            headers: {
                'Accept': 'text/event-stream',
                'Authorization': 'Bearer <your-jwt-token>'
            },
            eventTypes: ['connected', 'insert', 'update', 'delete', 'replace', 'heartbeat', 'error']
        }
    });
};

export { subscribeToTaskChanges, subscribeToTaskById, getSSEInfo };
