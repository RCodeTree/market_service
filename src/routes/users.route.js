const usersController = require('../controllers/users.controller');
const route = require('express').Router();


route.get('/', usersController.getAllUsers);

module.exports = route;
