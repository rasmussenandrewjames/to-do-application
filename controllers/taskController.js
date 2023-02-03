const handleTasks = require('../models/handleTasks');
const handleUsers = require('../models/handleUsers');

let errorMessage;

module.exports = {
    // GET dashboard page.
    getDashboard: async (req, res) => {
        try {
            // Check if a user is logged in.
            if (req.session.loggedIn) {
                const user = await handleUsers.getUser({ "_id": req.session.user[0]._id }); // Find user in database from req.session.
                const tasks = await handleTasks.getTask({ "user": req.session.user[0]._id, "completed": false }); // Find the tasks for the specific user, which isn't complete.
                const completeTasks = await handleTasks.getTask({ "user": req.session.user[0]._id, "completed": true }); // Find the tasks for the specific user, which is complete.
                // If session user id matches user id from database, render the dashboard with that specific users username and tasks.
                if (req.session.user[0]._id === user[0]._id.toString()) {
                    res.render('dashboard', {
                        title: 'Dashboard',
                        username: user[0].username,
                        tasks: tasks,
                        completeTasks: completeTasks ? completeTasks : null,
                        errorMessage: errorMessage ? errorMessage : ''
                    });
                    errorMessage = '';
                }
            }
            // If a user isn't logged in, redirect them to index page.
            else {
                res.redirect('/');
            }
        } catch (error) {
            res.send(error);
        }
    },
    // Logout and clear sessions.
    logout: (req, res) => {
        req.session.loggedIn ? req.session.loggedIn = false : req.session.loggedIn = false;
        req.session.user ? req.session.user = undefined : req.session.user = undefined;
        res.redirect('/');
    },
    // Create a new task.
    createTask: async (req, res) => {
        try {
            if (req.session.loggedIn) {
                await handleTasks.postTask(req, function (success) {
                    if (success) {
                        res.redirect('/dashboard');
                    } else {
                        errorMessage = 'Not a valid date. Please try again.';
                        res.redirect('/dashboard');
                    }
                });
            } else {
                res.redirect('/');
            }
        } catch (error) {
            res.json({ message: `Error in creating a new task route -> ${error.message}` });
        }
    },
    // Delete and archive a task.
    archiveTask: async (req, res) => {
        try {
            if (req.session.loggedIn) {
                await handleTasks.deleteTask({ "_id": req.params.id }); // Find task based on id, archive and delete it.        
                res.redirect('/dashboard');
            } else {
                res.redirect('/');
            }
        } catch (error) {
            res.json({ message: `Error in deleting a task route -> ${error.message}` });
        }
    },
    // Complete a task.
    completeTask: async (req, res) => {
        try {
            if (req.session.loggedIn) {
                await handleTasks.updateTask({ "_id": req.params.id }, { "completed": true }); // Find task based on id and mark it as complete.
                res.redirect('/dashboard');
            } else {
                res.redirect('/');
            }
        } catch (error) {
            res.json({ message: `Error in marking a task as complete route -> ${error.message}` });
        }
    },
    // Restore a task.
    restoreTask: async (req, res) => {
        try {
            if (req.session.loggedIn) {
                await handleTasks.updateTask({ "_id": req.params.id }, { "completed": false }); // Find task based on id and mark it as incomplete.
                res.redirect('/dashboard');
            } else {
                res.redirect('/');
            }
        } catch (error) {
            res.json({ message: `Error in marking a task as incomplete route -> ${error.message}` });
        }
    }
}