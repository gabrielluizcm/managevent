const express = require('express');
const route = express.Router();
const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');
const eventController = require('./src/controllers/eventController');

// Home routes
route.get('/', homeController.index);

// Login routes
route.get('/login/', loginController.index);
route.post('/login/', loginController.signin);
route.get('/signup/', loginController.signup);
route.post('/signup/', loginController.register);
route.get('/logout/', loginController.logout);

// Events routes
route.get('/events/create/', eventController.add);
route.post('/events/create/', eventController.create);
route.get('/events/edit/:id', eventController.edit);
route.post('/events/edit/:id', eventController.patch);
route.get('/events/details/:id', eventController.details);
route.get('/events/send/:id', eventController.send);
route.post('/events/send/:id', eventController.dispatch);

module.exports = route;
