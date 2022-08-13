const express = require('express');
const route = express.Router();
const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');

// Home routes
route.get('/', homeController.index);

// Login routes
route.get('/login/', loginController.index);
route.post('/login/', loginController.signin);
route.get('/signup/', loginController.signup);
route.post('/signup/', loginController.register);
route.get('/logout/', loginController.logout);

module.exports = route;
