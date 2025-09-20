const usersModel = require('../models/users.model');

class UsersService {
    static async getAllUsers() {
        let user = new usersModel();
        user = await usersModel.getAllUsers();
        return user;
    }
}

module.exports = UsersService;
