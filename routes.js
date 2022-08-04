const express = require('express');
const route = express.Router();
const homeController = require('./src/controllers/homeController');
const contactController = require('./src/controllers/contactController');

// Home routes
route.get('/', homeController.index);
route.post('/', homeController.postEndpoint);

// Contact routes
route.get('/contato', contactController.index);


module.exports = route;
